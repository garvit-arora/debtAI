import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    // Added 'flex-shrink-0' to prevent squishing
    // Changed 'z-99' to 'z-50' (standard Tailwind) or use 'z-[99]'
    <div className="h-screen w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col p-4 z-50">
      <h1 className="text-2xl font-bold mb-8">DebtAI</h1>

      <nav className="flex flex-col gap-4">
        <NavLink
          to="/landing-page"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/pending"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Pending
        </NavLink>

        <NavLink
          to="/bank"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Bank
        </NavLink>

        <NavLink
          to="/charts"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Charts
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Calendar
        </NavLink>
        <NavLink
          to="/stocks"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          Stocks
        </NavLink>
        <NavLink
          to="/debtai"
          className={({ isActive }) =>
            `hover:text-amber-400 ${
              isActive ? "text-amber-400 font-semibold" : ""
            }`
          }
        >
          DebtAI
        </NavLink>
      </nav>
    </div>
  );
}