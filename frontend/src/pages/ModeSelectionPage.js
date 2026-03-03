export default function ModeSelectionPage({ setStep }) {

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>

      <h2>Choose Voting Mode</h2>

      <br />

      <button
        style={{ padding: 10, marginRight: 20 }}
        onClick={() => setStep("voting")}
      >
        Normal Voting
      </button>

      <button
        style={{ padding: 10 }}
        onClick={() => setStep("accessible")}
      >
        Accessible Voting
      </button>

    </div>
  );
}