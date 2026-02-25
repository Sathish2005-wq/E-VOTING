import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function AdminMode() {

  const [mode, setMode] = useState("TEST");

  useEffect(() => {
    axios.get(`${API}/get-mode`)
      .then(res => setMode(res.data.mode));
  }, []);

  const toggleMode = async () => {

    const newMode = mode === "TEST" ? "REAL" : "TEST";

    const res = await axios.post(
      `${API}/set-mode`,
      { mode: newMode }
    );

    setMode(res.data.mode);
  };

  return (
    <div>
      <h2>Election Mode</h2>

      <h3>
        Current Mode:
        <span style={{
          color: mode === "TEST" ? "orange" : "red"
        }}>
          {" "}{mode}
        </span>
      </h3>

      <button onClick={toggleMode}>
        Switch Mode
      </button>
    </div>
  );
}