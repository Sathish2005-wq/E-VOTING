export default function DetailsPage({ user, setStep }) {

  if (!user) {
    return <h2 style={{ textAlign: "center" }}>No Voter Data Found</h2>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>

      <h2>Voter Details</h2>

      <div style={{
        display: "inline-block",
        padding: 20,
        border: "2px solid #333",
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        minWidth: 300
      }}>

        <p><b>QR ID:</b> {user.qr_string}</p>
        <p><b>Name:</b> {user.voter_info.name}</p>
        <p><b>Gender:</b> {user.voter_info.gender}</p>
        <p><b>Age:</b> {user.voter_info.age}</p>

      </div>

      <br /><br />

      <button
        style={{ padding: 10, marginRight: 10 }}
        onClick={() => setStep("face")}
      >
        Proceed to Face Authentication
      </button>

      <br /><br />

      <button
        style={{ padding: 10 }}
        onClick={() => setStep("qr")}
      >
        Cancel
      </button>

    </div>
  );
}