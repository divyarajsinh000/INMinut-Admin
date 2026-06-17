import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit, FiPlus, FiTrash2, FiCode } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const EmbedList = () => {
  const { user } = useAuth();
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmbeds = async () => {
    try {
      const res = await axiosInstance.get("/embeds");
      setEmbeds(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load embeds");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmbed = async (id) => {
    try {
      await axiosInstance.patch(`/embeds/${id}/toggle`);
      toast.success("Embed status updated");
      fetchEmbeds();
    } catch (error) {
      toast.error("Failed to update embed status");
    }
  };

  const deleteEmbed = async (id) => {
    if (!window.confirm("Are you sure you want to delete this embed?")) return;

    try {
      await axiosInstance.delete(`/embeds/${id}`);
      toast.success("Embed deleted successfully");
      fetchEmbeds();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete embed");
    }
  };

  useEffect(() => {
    fetchEmbeds();
  }, []);

  return (
    <AdminLayout title="Embed Codes">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Embed Cards</h2>
          <p className="text-slate-500 font-medium mt-1">Manage external HTML, iframe, social media embeds, custom code cards, heights, and positions.</p>
        </div>
        <Link to="/embeds/add" className="inline-flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3 rounded-2xl font-black hover:bg-red-600 shadow-lg shadow-red-500/25">
          <FiPlus /> Add Embed Code
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10 font-bold">Loading...</p>
      ) : embeds.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] border border-red-100 p-10 text-center text-slate-500 font-bold">
          No embed cards added yet
        </div>
      ) : (
        <div className="grid gap-5">
          {embeds.map((item) => (
            <article key={item._id} className="bg-white/90 backdrop-blur rounded-[1.6rem] shadow-sm border border-red-100 p-5 hover:shadow-xl hover:shadow-red-100">
              <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_auto] gap-5 items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <FiCode size={32} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-black ${item.isEnabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.isEnabled ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full font-black">
                      After {item.positionAfterNews} news
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-black">
                      Height: {item.height}px
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-full font-black">
                      {item.viewCount || 0} Views
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full font-black">
                      {item.clickCount || 0} Clicks
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 mb-2 line-clamp-1">{item.title}</h3>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <code className="text-xs text-slate-600 font-mono block max-h-16 overflow-y-auto break-all whitespace-pre-wrap">
                      {item.embedCode}
                    </code>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => toggleEmbed(item._id)}
                    className={`px-4 py-3 rounded-2xl font-black text-sm ${item.isEnabled ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                  >
                    {item.isEnabled ? "Disable" : "Enable"}
                  </button>
                  <Link to={`/embeds/edit/${item._id}`} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 flex items-center justify-center">
                    <FiEdit className="text-slate-700" />
                  </Link>
                  {user?.role === "super-admin" && (
                    <button onClick={() => deleteEmbed(item._id)} className="p-3 bg-red-50 rounded-2xl hover:bg-red-100">
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

export default EmbedList;
