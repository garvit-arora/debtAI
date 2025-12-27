import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const auth = getAuth();
  const navigate = useNavigate();

  const saveUser = async () => {
    const user = auth.currentUser;
    const db = getDatabase();

    await set(ref(db, "users/" + user.uid), {
      email: user.email,
      onboarded: true,
      createdAt: Date.now(),
    });

    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <button onClick={saveUser}>Continue</button>
    </div>
  );
}

export default Onboarding;
