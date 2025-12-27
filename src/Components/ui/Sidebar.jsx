import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">TearsWipe</h1>

      <nav className="flex flex-col gap-4">
        <NavLink to="/dashboard" className="hover:text-amber-400">
          Dashboard
        </NavLink>

        <NavLink to="/analytics" className="hover:text-amber-400">
          Analytics
        </NavLink>

        <NavLink to="/profile" className="hover:text-amber-400">
          Profile
        </NavLink>

        <NavLink to="/settings" className="hover:text-amber-400">
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
