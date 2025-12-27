import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
