import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function VotingPage({ user }) {

  const vote = async (candidate) => {

    try {

      const res = await axios.post(
        `${API}/vote`,
        {
          qr_string: user.qr_string,   // IMPORTANT
          candidate: candidate
        }
      );

      if (res.data.status === "vote_success") {
        alert("Vote Successful 🎉");
      } else if (res.data.status === "already_voted") {
        alert("Already Voted ❌");
      } else {
        alert("Vote Failed");
      }

    } catch (error) {
      console.log("Vote Error:", error.response?.data);
      alert("Vote Failed");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Select Candidate</h2>

      <button onClick={() => vote("Candidate_A")}>
        Candidate A
      </button>

      <br /><br />

      <button onClick={() => vote("Candidate_B")}>
        Candidate B
      </button>
    </div>
  );
}