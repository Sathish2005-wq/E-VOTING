import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function VotingPage({ user }) {

  const vote = async (candidate) => {

    try {
      const res = await axios.post(
        `${API}/vote`,
        {
          voter_id: user.voter_id,
          candidate: candidate
        }
      );

      alert(res.data.status);

    } catch (error) {
      alert("Vote Failed");
    }
  };

  return (
    <div>
      <h2>Select Candidate</h2>

      <button onClick={() => vote("Candidate 1")}>
        Candidate 1
      </button>

      <button onClick={() => vote("Candidate 2")}>
        Candidate 2
      </button>

      <button onClick={() => vote("Candidate 3")}>
        Candidate 3
      </button>
    </div>
  );
}