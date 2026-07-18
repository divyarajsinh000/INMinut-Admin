import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { appLogo } = useSettings();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(form.email, form.password);
    if (success) navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-red-900/25 blur-3xl" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden bg-white shadow-2xl relative z-10">
        <div className="hidden lg:flex bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-10 text-white flex-col justify-between">
          <div className="flex items-center gap-3">
            <img
              src={appLogo || "/logo-light.png"}
              alt="INMinut"
              className="h-12 w-48 rounded-2xl object-contain drop-shadow-sm"
            />
            <div>
              <p className="text-white/75 font-semibold">Admin control center</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black leading-tight">Publish local news faster.</h2>
            <p className="mt-4 text-white/80 text-lg leading-7">
              Manage breaking stories, categories, locations and app users from one clean dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-12">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <img
              src={appLogo || "/logo-light.png"}
              alt="INMinut"
              className="h-11 w-44 rounded-2xl object-contain"
            />
            <div>
              <p className="text-sm text-slate-500 font-semibold">Admin Panel</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-950">Welcome back</h1>
          <p className="text-slate-500 mt-2 font-medium">Login to manage news and city-wise alerts.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-red-400">
                <FiMail className="text-slate-400" />
                <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full bg-transparent outline-none font-semibold text-slate-800" placeholder="admin@example.com" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-red-400">
                <FiLock className="text-slate-400" />
                <input name="password" value={form.password} onChange={handleChange} type="password" required className="w-full bg-transparent outline-none font-semibold text-slate-800" placeholder="********" />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 disabled:opacity-60 shadow-lg shadow-red-500/25">
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>


        </form>
      </div>
    </div>
  );
};

export default Login;
