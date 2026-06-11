import { useState, useEffect } from "react";
import { FiFileText, FiTag, FiSmartphone, FiTrendingUp } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [totalNews, setTotalNews] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalGuestUsers, setTotalGuestUsers] = useState(0);

  const fetchStats = async () => {
    const [newsRes, categoriesRes, guestUsersRes] = await Promise.allSettled([
      axiosInstance.get("/news"),
      axiosInstance.get("/categories"),
      axiosInstance.get("/guest-users"),
    ]);

    if (newsRes.status === "fulfilled") setTotalNews(newsRes.value.data.data.length);
    if (categoriesRes.status === "fulfilled") setTotalCategories(categoriesRes.value.data.data.length);
    if (guestUsersRes.status === "fulfilled") setTotalGuestUsers(guestUsersRes.value.data.data.length);
    if (newsRes.status === "rejected" || categoriesRes.status === "rejected") toast.error("Failed to load stats");
  };

  useEffect(() => { fetchStats(); }, []);

  const cards = [
    { label: "Total News", value: totalNews, icon: FiFileText, color: "from-cyan-500 to-cyan-600" },
    { label: "Categories", value: totalCategories, icon: FiTag, color: "from-indigo-500 to-violet-600" },
    { label: "App Guest Users", value: totalGuestUsers, icon: FiSmartphone, color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-7 rounded-[2rem] bg-slate-950 p-7 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-cyan-300 font-black uppercase tracking-widest text-xs">Overview</p>
            <h2 className="text-3xl font-black mt-2">Manage city-wise breaking news</h2>
            <p className="text-slate-300 mt-2 max-w-2xl">Track posts, categories and registered app devices from one modern dashboard.</p>
          </div>
          <div className="hidden md:flex h-16 w-16 rounded-3xl bg-white/10 items-center justify-center text-cyan-300">
            <FiTrendingUp className="text-3xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white/90 backdrop-blur rounded-[1.5rem] shadow-sm border border-cyan-100 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-100">
              <div className="flex items-center justify-between">
                <div className={`h-13 w-13 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center p-4 shadow-lg`}>
                  <Icon className="text-2xl" />
                </div>
                <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">Live</span>
              </div>
              <p className="text-slate-500 text-sm font-bold mt-5">{card.label}</p>
              <h2 className="text-4xl font-black mt-1 text-slate-950">{card.value}</h2>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
