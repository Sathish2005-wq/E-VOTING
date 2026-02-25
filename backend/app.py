from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import base64
import numpy as np
import cv2
import face_recognition
import hashlib

app = Flask(__name__)
CORS(app)

# ==========================
# HELPERS
# ==========================

def load_json(file):
    if not os.path.exists(file):
        return {}
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        return {}

def save_json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

# ==========================
# MODE CONTROL
# ==========================

MODE_FILE = "mode.json"

def load_mode():
    if not os.path.exists(MODE_FILE):
        return "TEST"
    return load_json(MODE_FILE).get("mode", "TEST")

def save_mode(mode):
    save_json(MODE_FILE, {"mode": mode})

@app.route("/get-mode")
def get_mode():
    return jsonify({"mode": load_mode()})

@app.route("/set-mode", methods=["POST"])
def set_mode():
    mode = request.json.get("mode", "TEST")
    save_mode(mode)
    return jsonify({"status": "updated", "mode": mode})

# ==========================
# ROOT
# ==========================

@app.route("/")
def home():
    return "E-Voting Backend Running"

# ==========================
# REGISTER (QR + FACE)
# ==========================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    required = ["name", "gender", "age", "image", "qr_data"]
    if not data or not all(field in data for field in required):
        return jsonify({"status": "invalid_request"}), 400

    qr_string = data["qr_data"].strip()

    database = load_json("voter_database.json")

    if qr_string in database:
        return jsonify({"status": "already_registered"})

    # Create safe filename using hash
    qr_hash = hashlib.sha256(qr_string.encode()).hexdigest()[:12]

    database[qr_string] = {
        "name": data["name"],
        "gender": data["gender"],
        "age": data["age"],
        "face_file": qr_hash + ".jpg"
    }

    save_json("voter_database.json", database)

    # Save face image
    img_bytes = base64.b64decode(data["image"].split(",")[1])
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if not os.path.exists("voters"):
        os.makedirs("voters")

    cv2.imwrite(f"voters/{qr_hash}.jpg", img)

    return jsonify({"status": "registered"})

# ==========================
# VERIFY QR
# ==========================

@app.route("/verify-qr", methods=["POST"])
def verify_qr():

    data = request.get_json()

    if not data or "qr_data" not in data:
        return jsonify({"status": "invalid_request"}), 400

    qr_string = data["qr_data"].strip()

    database = load_json("voter_database.json")

    if qr_string not in database:
        return jsonify({"status": "not_registered"})

    return jsonify({
        "status": "success",
        "qr_string": qr_string,
        "voter_info": database[qr_string]
    })

# ==========================
# VERIFY FACE
# ==========================

@app.route("/verify-face", methods=["POST"])
def verify_face():

    data = request.get_json()

    if not data or "qr_string" not in data or "image" not in data:
        return jsonify({"status": "invalid_request"}), 400

    qr_string = data["qr_string"].strip()
    image_data = data["image"]

    database = load_json("voter_database.json")

    if qr_string not in database:
        return jsonify({"status": "not_registered"})

    face_file = database[qr_string]["face_file"]
    stored_path = f"voters/{face_file}"

    if not os.path.exists(stored_path):
        return jsonify({"status": "face_not_found"})

    try:
        # Decode live image
        img_bytes = base64.b64decode(image_data.split(",")[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_live = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Convert BGR → RGB
        img_live = cv2.cvtColor(img_live, cv2.COLOR_BGR2RGB)

        # Resize for stability
        img_live = cv2.resize(img_live, (640, 480))

        # Load stored image
        img_stored = face_recognition.load_image_file(stored_path)

    except Exception as e:
        print("Image Error:", e)
        return jsonify({"status": "image_error"})

    # Get encodings
    enc_live = face_recognition.face_encodings(img_live)
    enc_stored = face_recognition.face_encodings(img_stored)

    if len(enc_live) == 0:
        return jsonify({"status": "no_face_live"})

    if len(enc_stored) == 0:
        return jsonify({"status": "no_face_stored"})

    # Compare
    distance = face_recognition.face_distance(
        [enc_stored[0]],
        enc_live[0]
    )[0]

    print("Face distance:", distance)

    # Increase tolerance slightly
    if distance < 0.6:
        return jsonify({"status": "verified"})
    else:
        return jsonify({"status": "failed"})
# ==========================
# VOTE
# ==========================

@app.route("/vote", methods=["POST"])
def vote():

    data = request.get_json()

    if not data or "qr_string" not in data or "candidate" not in data:
        return jsonify({"status": "invalid_request"}), 400

    qr_string = data["qr_string"]
    candidate = data["candidate"]

    voted = load_json("voted_status.json")
    mode = load_mode()

    if mode == "REAL":
        if voted.get(qr_string):
            return jsonify({"status": "already_voted"})

    voted[qr_string] = candidate
    save_json("voted_status.json", voted)

    return jsonify({"status": "vote_success", "mode": mode})

# ==========================
# START SERVER
# ==========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)