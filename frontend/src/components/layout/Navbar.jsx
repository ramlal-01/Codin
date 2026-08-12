import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isActive
        ? "bg-sky-400/12 text-sky-100 ring-1 ring-sky-300/25"
        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/20 bg-[#07111f] text-slate-100 shadow-xl shadow-black/25">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to={token ? "/dashboard" : "/"} className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-sky-300/30 bg-[#0d1b2e] text-sm font-black text-sky-200 shadow-inner shadow-sky-900/30 transition-transform group-hover:-translate-y-0.5">
            &lt;/&gt;
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-black tracking-tight text-white">CodIn</span>
            <span className="hidden text-xs font-medium text-sky-200 sm:block">collaborative coding rooms</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950/55 p-1 text-sm shadow-inner shadow-white/5">
          {token ? (
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/dashboard#rooms" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white">
                My Rooms
              </NavLink>
              <NavLink to="/dashboard#create-room" className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-md shadow-sky-950/30 transition hover:-translate-y-0.5 hover:bg-sky-200">
                New Room
              </NavLink>
              <span className="hidden max-w-36 truncate rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300 md:inline">{user?.name}</span>
              <button onClick={handleLogout} className="rounded-lg bg-slate-800 px-3 py-2 font-medium text-slate-200 transition hover:bg-red-950 hover:text-red-100">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <Link to="/signup" className="rounded-lg bg-sky-300 px-4 py-2 font-bold text-slate-950 shadow-md shadow-sky-950/30 transition hover:-translate-y-0.5 hover:bg-sky-200">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
