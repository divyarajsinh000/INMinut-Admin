import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";


import ToggleSwitch from "../components/ToggleSwitch";

import EmbedAppPreview from "../components/EmbedAppPreview";
import EmbedCategoryPicker from "../components/EmbedCategoryPicker";

const AddEmbed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    embedCode: "",
    shareUrl: "",
    height: 250,
    positionAfterNews: 5,
    isEnabled: true,
    categories: [],
  });

  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories?includeHidden=true");
        const list = res.data?.data;
        if (!Array.isArray(list)) throw new Error("Invalid category response");
        setCategories(list);
        setCategoriesReady(true);
      } catch (error) {
        toast.error("Failed to load categories. Please reload before saving.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoriesReady) { toast.error("Categories are not loaded. Please reload before saving."); return; }
    if (!form.title.trim() || !form.embedCode.trim()) {
      toast.error("Title and Embed Code are required");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/embeds", {
        title: form.title,
        embedCode: form.embedCode,
        shareUrl: form.shareUrl.trim(),
        height: Number(form.height),
        positionAfterNews: Number(form.positionAfterNews),
        isEnabled: form.isEnabled,
        categories: form.categories || [],
      });

      toast.success("Embed card added successfully");
      navigate("/embeds");
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to add embed card"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Embed Code">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-red-100 p-6 w-full lg:max-w-3xl">
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
              placeholder="Paste <iframe>, <script> block, HTML, or a direct URL link here..."
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Ensure the code contains correct responsive tags, or paste a direct URL (e.g., https://youtube.com/...).</p>
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
<div className="space-y-2">
  <label className="block text-sm font-semibold">
    Share URL
    <span className="ml-2 text-xs font-normal text-gray-400">
      (Optional)
    </span>
  </label>

  <input
    type="url"
    name="shareUrl"
    value={form.shareUrl}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        shareUrl: e.target.value,
      }))
    }
    placeholder="https://example.com/content"
    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600"
  />

  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
    This link will be shared when users click the share icon
    in the mobile app. If left empty, the app will try to
    extract a link from the embed code automatically.
  </p>
</div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Categories</label>
            <EmbedCategoryPicker categories={categories} value={form.categories} ready={categoriesReady} onChange={(values) => setForm((prev) => ({ ...prev, categories: values }))} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-bold text-slate-800">Display Embed In App</p>
              <p className="text-xs text-slate-500">Turn off to save embed now and show it later.</p>
            </div>
            <ToggleSwitch
              checked={form.isEnabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading || !categoriesReady}
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

        <div className="w-full shrink-0 lg:sticky lg:top-5 lg:w-[390px]">
          <EmbedAppPreview form={form} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddEmbed;
