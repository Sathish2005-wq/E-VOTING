import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function QrPage({ setStep, setUser }) {

  useEffect(() => {

    const qr = new Html5Qrcode("reader");

    qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {

        await qr.stop();

        try {
          const res = await axios.post(
            `${API}/verify-qr`,
            { qr_data: decodedText }
          );

          if (res.data.status === "success") {
            setUser(res.data);
            setStep("details");
          } else {
            alert("Voter Not Registered");
          }

        } catch (error) {
          alert("Backend Connection Error");
        }
      }
    );

  }, []);

  return (
    <div>
      <h2>Scan Voter QR</h2>
      <div id="reader" style={{ width: 400, margin: "auto" }}></div>
    </div>
  );
}