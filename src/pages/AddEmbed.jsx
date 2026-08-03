import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";


const getPreviewUrl = (value = "") => {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed) || trimmed.includes(" ") || /<(iframe|script|video|embed|object)/i.test(trimmed)) {
    return "";
  }

  const youtubeMatch = trimmed.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  return youtubeMatch?.[1]
    ? `https://www.youtube.com/embed/${youtubeMatch[1]}`
    : trimmed;
};

const EmbedAppPreview = ({ form }) => {
  const height = Math.max(80, Number(form.height) || 250);
  const code = form.embedCode?.trim() || "";
  const previewUrl = getPreviewUrl(code);

  return (
    <div className="w-full rounded-[30px] border-4 border-slate-300 bg-slate-100 p-4 shadow-xl">
      <div className="mb-2 text-center">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
          Live app preview
        </span>
      </div>

      <div className="h-[690px] overflow-y-auto rounded-[24px] bg-[#F8FAFC] p-2">
        <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_28px_rgba(14,165,233,0.14)]">
          <div className="flex min-h-[66px] items-center gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-black text-slate-900">
                {form.title?.trim() || "Embed card title"}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Embedded content
              </p>
            </div>
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px] border border-slate-200 bg-slate-50 text-slate-900">
              <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4" />
              </svg>
            </div>
          </div>

          <div className="w-full overflow-hidden bg-white" style={{ height: `${height}px` }}>
            {!code ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">
                Paste embed HTML or a direct URL to preview it here.
              </div>
            ) : previewUrl ? (
              <iframe
                title="Embed URL preview"
                src={previewUrl}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            ) : (
              <iframe
                title="Embed HTML preview"
                srcDoc={code}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            )}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs font-semibold text-slate-500">
          App card height: {height} px
        </div>
      </div>
    </div>
  );
};

const AddEmbed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    embedCode: "",
    height: 250,
    positionAfterNews: 5,
    isEnabled: true,
    categories: [],
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data.data);
      } catch (error) {
        console.error("Failed to load categories");
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
        categories: JSON.stringify(form.categories || []),
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Categories</label>
            <select
              name="categories"
              value={form.categories || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                setForm((prev) => ({ ...prev, categories: values }));
              }}
              multiple
              className="w-full border rounded-xl px-4 py-3 min-h-[130px] outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd) to select multiple. Leave empty to show in all categories.</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-bold text-slate-800">Display Embed In App</p>
              <p className="text-xs text-slate-500">Turn off to save embed now and show it later.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
              <input
                name="isEnabled"
                type="checkbox"
                checked={form.isEnabled}
                onChange={handleChange}
                className="h-5 w-5 accent-red-500"
              />
              {form.isEnabled ? "On" : "Off"}
            </label>
          </div>

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

        <div className="w-full shrink-0 lg:sticky lg:top-5 lg:w-[390px]">
          <EmbedAppPreview form={form} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddEmbed;
