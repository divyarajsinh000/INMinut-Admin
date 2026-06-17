import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const AddEmbed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    embedCode: "",
    height: 250,
    positionAfterNews: 5,
    isEnabled: true,
  });

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
      await axiosInstance.post("/embeds", {
        title: form.title,
        embedCode: form.embedCode,
        height: Number(form.height),
        positionAfterNews: Number(form.positionAfterNews),
        isEnabled: form.isEnabled,
      });

      toast.success("Embed card added successfully");
      navigate("/embeds");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add embed card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Embed Code">
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Twitter/X Feed Widget"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
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
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-slate-500 mt-1">Height of the container in the app feed (e.g. 250). always add 20PX more then the actual height.</p>
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
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-5 h-5 accent-red-500"
            />
            <span className="text-sm font-semibold text-slate-700">Enable embed card immediately</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Embed"}
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
      </div>
    </AdminLayout>
  );
};

export default AddEmbed;
