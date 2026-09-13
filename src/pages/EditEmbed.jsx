import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";
import ToggleSwitch from "../components/ToggleSwitch";


const decodeEmbedValue = (value = "") =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();

const extractIframeSrc = (value = "") => {
  const match = decodeEmbedValue(value).match(
    /<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i
  );

  return match?.[1]?.trim() || "";
};

const normalizeEmbedUrl = (value = "") => {
  const url = decodeEmbedValue(value);
  if (!/^https?:\/\//i.test(url) || /\s/.test(url)) return "";

  // YouTube watch, share and Shorts URLs.
  const youtubeMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^"&?/\s]{11})/i
  );
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo public video URLs.
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};

const buildHtmlDocument = (html = "") => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
    <style>
      html, body {
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        overflow: auto;
        background: transparent;
      }
      *, *::before, *::after { box-sizing: border-box; }
      iframe, video, embed, object, img, svg, canvas {
        max-width: 100% !important;
      }
      iframe, video, embed, object {
        width: 100% !important;
        border: 0;
      }
    </style>
  </head>
  <body>${html}</body>
</html>`;

const getPreviewData = (value = "") => {
  const code = decodeEmbedValue(value);

  if (!code) return { type: "empty", value: "" };

  // Any iframe provider: YouTube, Vimeo, Maps, Facebook, forms, dashboards, etc.
  const iframeSrc = extractIframeSrc(code);
  if (iframeSrc) {
    return {
      type: "url",
      value: normalizeEmbedUrl(iframeSrc) || iframeSrc,
    };
  }

  // A directly pasted link.
  const directUrl = normalizeEmbedUrl(code);
  if (directUrl) return { type: "url", value: directUrl };

  // Generic HTML, script widgets, blockquotes, video tags and other snippets.
  return {
    type: "html",
    value: buildHtmlDocument(code),
  };
};

const EmbedAppPreview = ({ form }) => {
  const height = Math.max(80, Number(form.height) || 250);
  const preview = getPreviewData(form.embedCode);

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
            {preview.type === "empty" ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">
                Paste embed HTML or a direct URL to preview it here.
              </div>
            ) : preview.type === "url" ? (
              <iframe
                key={preview.value}
                title="Embed URL preview"
                src={preview.value}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <iframe
                key={preview.value}
                title="Embed HTML preview"
                srcDoc={preview.value}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals allow-downloads"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs font-semibold text-slate-500">
          App card height: {height} px
        </div>

        <p className="mt-2 px-2 text-center text-[11px] font-semibold leading-4 text-slate-400">
          Some providers block third-party iframe previews using their own security headers. Those embeds cannot be forced to load from the frontend.
        </p>
      </div>
    </div>
  );
};

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
    categories: [],
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories?includeHidden=true");
        const payload = res?.data?.data ?? res?.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : [];

        setCategories(list);
      } catch (error) {
        setCategories([]);
        console.error("Failed to load categories", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
        toast.error(formatErrorMessage(error, "Failed to load categories"));
      }
    };
    fetchCategories();
  }, []);

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
          categories: data.categories ? data.categories.map(c => c._id || c) : [],
        });
      }
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to load embed details"));
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
        categories: JSON.stringify(form.categories || []),
      });

      toast.success("Embed card updated successfully");
      navigate("/embeds");
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to update embed card"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmbed();
  }, [id]);

  return (
    <AdminLayout title="Edit Embed Code">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-red-100 p-6 w-full lg:max-w-3xl">
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
                <p className="text-xs text-slate-500">Turn off to hide embed in the app.</p>
              </div>
              <ToggleSwitch
                checked={form.isEnabled}
                onChange={(checked) => setForm((prev) => ({ ...prev, isEnabled: checked }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60"
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

        {!fetching && (
          <div className="w-full shrink-0 lg:sticky lg:top-5 lg:w-[390px]">
            <EmbedAppPreview form={form} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditEmbed;
