import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const EditEmbed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    embedCode: "",
    height: 250,
    positionAfterNews: 5,
    isEnabled: true,
  });

  const fetchEmbed = async () => {
    try {
      const res = await axiosInstance.get(`/embeds/${id}`);
      const data = res.data.data;
      if (data) {
        setForm({
          title: data.title || "",
          embedCode: data.embedCode || "",
          height: data.height || 250,
          positionAfterNews: data.positionAfterNews !== undefined ? data.positionAfterNews : 5,
          isEnabled: data.isEnabled ?? true,
        });
      }
    } catch (error) {
      toast.error("Failed to load embed details");
      navigate("/embeds");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.embedCode.trim()) {
      toast.error("Title and Embed Code are required");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put(`/embeds/${id}`, {
        title: form.title,
        embedCode: form.embedCode,
        height: Number(form.height),
        positionAfterNews: Number(form.positionAfterNews),
        isEnabled: form.isEnabled,
      });

      toast.success("Embed card updated successfully");
      navigate("/embeds");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update embed card");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmbed();
  }, [id]);

  return (
    <AdminLayout title="Edit Embed Code">
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 max-w-3xl">
        {fetching ? (
          <p className="text-center text-slate-500 py-10 font-bold">Loading details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Twitter/X Feed Widget"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">For internal identification in admin lists.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Embed HTML Code</label>
              <textarea
                name="embedCode"
                value={form.embedCode}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Paste <iframe>, <script> block, or HTML here..."
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Ensure the code contains correct responsive tags or matches the card size.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Card Height (in Pixels)</label>
                <input
                  name="height"
                  type="number"
                  min="50"
                  value={form.height}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">Height of the container in the app feed (e.g. 250).  always add 20PX more then the actual height.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Show after how many news items?</label>
                <input
                  name="positionAfterNews"
                  type="number"
                  min="0"
                  value={form.positionAfterNews}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">Set to 0 to show at the very top of the feed, or 5 to show after 5 news items.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2">
              <input
                name="isEnabled"
                type="checkbox"
                checked={form.isEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-cyan-500"
              />
              <span className="text-sm font-semibold text-slate-700">Enable embed card</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Update Embed"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/embeds")}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditEmbed;
