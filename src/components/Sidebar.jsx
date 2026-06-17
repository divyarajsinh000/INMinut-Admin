import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiTag,
  FiUsers,
  FiLogOut,
  FiSmartphone,
  FiMapPin,
  FiImage,
  FiBarChart2,
  FiX,
  FiUser,
  FiCode,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getFullMediaUrl } from "../components/MediaPreview";

const Sidebar = ({ open = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const linkClass = (path) =>
    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold tracking-tight ${
      isActive(path)
        ? "bg-white text-slate-950 shadow-xl shadow-red-950/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const navItems = user?.role === "reporter"
    ? [
        { to: "/news", icon: FiFileText, label: "News" },
        { to: "/profile", icon: FiUser, label: "Profile" },
      ]
    : [
        { to: "/dashboard", icon: FiHome, label: "Dashboard" },
        { to: "/news", icon: FiFileText, label: "News" },
        { to: "/analytics", icon: FiBarChart2, label: "Analytics" },
        { to: "/advertisements", icon: FiImage, label: "Advertisements" },
        { to: "/profile", icon: FiUser, label: "Profile" },
      ];

  const superAdminItems = [
    { to: "/categories", icon: FiTag, label: "Categories" },
    { to: "/locations", icon: FiMapPin, label: "Locations" },
    { to: "/guest-users", icon: FiSmartphone, label: "App Users" },
    { to: "/users", icon: FiUsers, label: "Admin Users" },
    { to: "/embeds", icon: FiCode, label: "Embed Codes" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/25 transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <img
            src="/logo-dark.png"
            alt="INMinut"
            className="h-11 w-36 rounded-2xl object-contain"
          />
          <div>
            <p className="text-xs font-semibold text-slate-400">News control center</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-white/10 p-2 text-slate-200 hover:bg-white/15 lg:hidden"
          aria-label="Close menu"
        >
          <FiX />
        </button>
      </div>

      <div className="relative z-10 m-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur flex items-center gap-3">
        {user?.profileImage ? (
          <img
            src={getFullMediaUrl(user.profileImage)}
            alt="Profile Avatar"
            className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-white/20 flex items-center justify-center text-red-300 shrink-0">
            <FiUser size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Logged in as</p>
          <p className="truncate font-black text-sm">{user?.name || "Admin"}</p>
          <span className="mt-1 inline-flex rounded-full border border-red-300/20 bg-red-400/10 px-2.5 py-0.5 text-[10px] font-black text-red-200 uppercase">
            {user?.role === "super-admin" ? "Super Admin" : user?.role || "Editor"}
          </span>
        </div>
      </div>

      <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {[...navItems, ...(user?.role === "super-admin" ? superAdminItems : [])].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} onClick={onClose} className={linkClass(item.to)}>
              <Icon className="shrink-0 text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-bold text-rose-200 hover:bg-rose-500/15"
        >
          <FiLogOut />Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
