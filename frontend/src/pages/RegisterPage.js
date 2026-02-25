import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function RegisterPage() {

  const webcamRef = useRef(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [qrData, setQrData] = useState("");
  const [qrScanned, setQrScanned] = useState(false);

  useEffect(() => {
    if (!qrScanned) {
      const qr = new Html5Qrcode("qr-reader");

      qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await qr.stop();
          setQrData(decodedText);
          setQrScanned(true);
        }
      ).catch(err => {
        console.log("QR Start Error:", err);
      });
    }
  }, [qrScanned]);

  const register = async () => {

    if (!qrData) {
      alert("Please scan QR first");
      return;
    }

    if (!webcamRef.current) {
      alert("Camera not ready");
      return;
    }

    const image = webcamRef.current.getScreenshot();

    if (!image) {
      alert("Please capture image");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/register`,
        {
          name: name,
          gender: gender,
          age: age,
          image: image,
          qr_data: qrData
        }
      );

      if (res.data.status === "registered") {
        alert("Registered Successfully");
      } else if (res.data.status === "already_registered") {
        alert("QR Already Registered");
      } else {
        alert("Registration Failed");
      }

    } catch (error) {
      console.log("Register Error:", error);
      alert("Backend Error");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>

      <h2>Register New Voter</h2>

      {!qrScanned && (
        <>
          <h3>Scan Original Voter ID QR</h3>
          <div id="qr-reader" style={{ width: 300, margin: "auto" }}></div>
        </>
      )}

      {qrScanned && (
        <>
          <p><b>QR Scanned Successfully</b></p>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br /><br />

          <input
            type="text"
            placeholder="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <br /><br />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <br /><br />

          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            audio={false}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />

          <br /><br />

          <button onClick={register}>Register</button>
        </>
      )}

    </div>
  );
}