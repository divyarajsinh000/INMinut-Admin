import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import MediaPreview from "../components/MediaPreview";

const getCityLabel = (cities = []) => {
  if (!Array.isArray(cities) || cities.length === 0) return "All cities";
  return cities.map((city) => city?.name).filter(Boolean).join(", ") || "Selected cities";
};

const AdvertisementList = () => {
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvertisements = async () => {
    try {
      const res = await axiosInstance.get("/advertisements");
      setAdvertisements(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvertisement = async (id) => {
    try {
      await axiosInstance.patch(`/advertisements/${id}/toggle`);
      toast.success("Advertisement status updated");
      fetchAdvertisements();
    } catch (error) {
      toast.error("Failed to update advertisement status");
    }
  };

  const deleteAdvertisement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      await axiosInstance.delete(`/advertisements/${id}`);
      toast.success("Advertisement deleted");
      fetchAdvertisements();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete advertisement");
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  return (
    <AdminLayout title="Advertisements">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Advertisement banners</h2>
          <p className="text-slate-500 font-medium mt-1">Control app banner ads, redirect links, city visibility and feed positions.</p>
        </div>
        <Link to="/advertisements/add" className="inline-flex items-center justify-center gap-2 bg-cyan-500 text-white px-5 py-3 rounded-2xl font-black hover:bg-cyan-600 shadow-lg shadow-cyan-500/25">
          <FiPlus /> Add Advertisement
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10 font-bold">Loading...</p>
      ) : advertisements.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] border border-cyan-100 p-10 text-center text-slate-500 font-bold">
          No advertisement added yet
        </div>
      ) : (
        <div className="grid gap-5">
          {advertisements.map((item) => (
            <article key={item._id} className="bg-white/90 backdrop-blur rounded-[1.6rem] shadow-sm border border-cyan-100 p-5 hover:shadow-xl hover:shadow-cyan-100">
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_auto] gap-5 items-start">
                <MediaPreview
                  src={item.bannerImage}
                  type="image"
                  name={item.name}
                  compact
                  showName
                  className="h-44 lg:h-36"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-xs px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full font-black">
                      {item.label || "Advertisement"}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-black ${item.isEnabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black">
                      After {item.positionAfterNews || 4} news
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-black ${item.cities?.length ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>
                      {getCityLabel(item.cities)}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 mb-2 line-clamp-2">{item.name}</h3>
                  <a href={item.redirectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-600 font-bold break-all">
                    {item.redirectUrl} <FiExternalLink />
                  </a>
                </div>

                <div className="flex lg:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => toggleAdvertisement(item._id)}
                    className={`px-4 py-3 rounded-2xl font-black text-sm ${item.isEnabled ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                  >
                    {item.isEnabled ? "Disable" : "Enable"}
                  </button>
                  <Link to={`/advertisements/edit/${item._id}`} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 flex items-center justify-center">
                    <FiEdit className="text-slate-700" />
                  </Link>
                  {user?.role === "super-admin" && (
                    <button onClick={() => deleteAdvertisement(item._id)} className="p-3 bg-red-50 rounded-2xl hover:bg-red-100">
                      <FiTrash2 className="text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdvertisementList;
