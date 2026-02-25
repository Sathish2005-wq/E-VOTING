import { useState } from "react";
import QrPage from "./pages/QrPage";
import DetailsPage from "./pages/DetailsPage";
import FacePage from "./pages/FacePage";
import VotingPage from "./pages/VotingPage";
import RegisterPage from "./pages/RegisterPage";
import AdminMode from "./pages/AdminMode";

function App() {

  const [step, setStep] = useState("qr");
  const [user, setUser] = useState(null);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>

      <div>
        <button onClick={() => setStep("qr")}>Start Voting</button>
        <button onClick={() => setStep("register")}>Register</button>
        <button onClick={() => setStep("admin")}>Admin Mode</button>
      </div>

      {step === "qr" && <QrPage setStep={setStep} setUser={setUser} />}
      {step === "details" && <DetailsPage user={user} setStep={setStep} />}
      {step === "face" && <FacePage user={user} setStep={setStep} />}
      {step === "voting" && <VotingPage user={user} />}
      {step === "register" && <RegisterPage />}
      {step === "admin" && <AdminMode />}

    </div>
  );
}

export default App;