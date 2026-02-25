import Webcam from "react-webcam";
import axios from "axios";
import { useRef, useEffect } from "react";

const API = "http://127.0.0.1:5000";

export default function FacePage({ user, setStep }) {

  const webcamRef = useRef(null);

  useEffect(() => {

    const interval = setInterval(async () => {

      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      try {

        const res = await axios.post(
          `${API}/verify-face`,
          {
            qr_string: user.qr_string,   // IMPORTANT FIX
            image: imageSrc
          }
        );

        console.log(res.data);

        if (res.data.status === "verified") {
          clearInterval(interval);
          alert("Face Verified Successfully");
          setStep("voting");
        }

      } catch (err) {
        console.log("Face Error:", err.response?.data);
      }

    }, 2000);

    return () => clearInterval(interval);

  }, [user, setStep]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Face Authentication</h2>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={500}
        audio={false}
      />
    </div>
  );
}