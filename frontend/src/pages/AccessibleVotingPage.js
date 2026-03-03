import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function AccessibleVotingPage({ user }) {

  const videoRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const baselineRef = useRef(null);
  const cooldownRef = useRef(false);

  const candidates = [
    "Candidate 1","Candidate 2","Candidate 3","Candidate 4","Candidate 5",
    "Candidate 6","Candidate 7","Candidate 8","Candidate 9","Candidate 10"
  ];

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    startVideo();
  };

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      trackHead();
    };
  };

  const triggerCooldown = () => {
    cooldownRef.current = true;
    setTimeout(() => cooldownRef.current = false, 800);
  };

  const trackHead = async () => {

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks();

    if (detection) {

      const nose = detection.landmarks.getNose()[3];
      const currentY = nose.y;

      if (baselineRef.current === null) {
        baselineRef.current = currentY;
      } else {

        const diff = currentY - baselineRef.current;

        if (!cooldownRef.current) {

          if (diff > 10) {
            setSelectedIndex(prev =>
              Math.min(prev + 1, candidates.length - 1)
            );
            triggerCooldown();
          }

          if (diff < -10) {
            setSelectedIndex(prev =>
              Math.max(prev - 1, 0)
            );
            triggerCooldown();
          }
        }
      }
    }

    requestAnimationFrame(trackHead);
  };

  const confirmVote = async () => {

    const res = await axios.post(`${API}/vote`, {
      qr_string: user.qr_string,
      candidate: candidates[selectedIndex]
    });

    if (res.data.status === "vote_success") {
      alert("Vote Cast Successfully ✅");
    } else {
      alert("Vote Failed");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Accessible Head Movement Voting</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        width="400"
      />

      <h3>Move head UP/DOWN to change selection</h3>

      {candidates.map((c, index) => (
        <div
          key={index}
          style={{
            padding: 12,
            margin: 6,
            background: index === selectedIndex ? "green" : "#eee",
            color: index === selectedIndex ? "white" : "black",
            fontWeight: "bold"
          }}
        >
          {c}
        </div>
      ))}

      <br />
      <button onClick={confirmVote}>
        Confirm Vote
      </button>
    </div>
  );
}