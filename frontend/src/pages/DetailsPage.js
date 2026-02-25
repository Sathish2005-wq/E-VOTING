export default function DetailsPage({ user, setStep }) {

  if (!user) return <h2>No Data</h2>;

  return (
    <div>
      <h2>Voter Details</h2>

      <p><b>Voter ID:</b> {user.voter_id}</p>
      <p><b>Name:</b> {user.voter_info.name}</p>
      <p><b>Gender:</b> {user.voter_info.gender}</p>
      <p><b>Age:</b> {user.voter_info.age}</p>

      <br />
      <button onClick={() => setStep("face")}>
        Proceed to Face Authentication
      </button>
    </div>
  );
}