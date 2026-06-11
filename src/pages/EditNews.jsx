import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import MediaSlider from "../components/MediaSlider";

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaToKeep, setMediaToKeep] = useState([]);
  const [form, setForm] = useState({
    title: "",
    titleColor: "#111827",
    titleFontSize: 22,
    description: "",
    descriptionFontSize: 16,
    content: "",
    media: [],
    category: "",
    reporter: { name: "", avatar: "" },
    hashtags: [""],
    isBreaking: false,
    breakingText: "Breaking News",
    isActive: true,
    publishedDate: new Date().toISOString().split("T")[0],
    cities: [],
  });

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axiosInstance.get("/locations/cities");
      setCities(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load cities");
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axiosInstance.get(`/news/${id}`);
      const news = res.data.data;
      setForm({
        ...news,
        category: news.category._id,
        titleColor: news.titleColor || "#111827",
        titleFontSize: news.titleFontSize || 22,
        descriptionFontSize: news.descriptionFontSize || 16,
        breakingText: news.breakingText || "Breaking News",
        isActive: news.isActive !== false,
        publishedDate: new Date(news.publishedDate).toISOString().split("T")[0],
        hashtags: news.hashtags.length > 0 ? news.hashtags : [""],
        cities: news.cities?.map((city) => city._id) || [],
      });
      setMediaToKeep(news.media.map(m => m._id));
    } catch (error) {
      toast.error("Failed to load news");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "cities") {
      const values = Array.from(e.target.selectedOptions).map((option) => option.value);
      setForm((prev) => ({ ...prev, cities: values }));
    } else if (name === "reporter.name" || name === "reporter.avatar") {
      setForm((prev) => ({
        ...prev,
        reporter: {
          ...prev.reporter,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf'
    ];
    
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (mediaId) => {
    if (window.confirm("Are you sure you want to delete this media file?")) {
      setMediaToKeep(prev => prev.filter(id => id !== mediaId));
      setForm(prev => ({
        ...prev,
        media: prev.media.filter(m => m._id !== mediaId)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('titleColor', form.titleColor || '#111827');
      formData.append('titleFontSize', form.titleFontSize || 22);
      formData.append('description', form.description);
      formData.append('descriptionFontSize', form.descriptionFontSize || 16);
      formData.append('content', form.content);
      formData.append('category', form.category);
      formData.append('reporter', JSON.stringify(form.reporter));
      formData.append('hashtags', JSON.stringify(form.hashtags.filter((tag) => tag.trim())));
      formData.append('isBreaking', form.isBreaking);
      formData.append('breakingText', form.breakingText || 'Breaking News');
      formData.append('isActive', form.isActive);
      formData.append('publishedDate', form.publishedDate);
      formData.append('cities', JSON.stringify(form.cities || []));
      formData.append('mediaToKeep', JSON.stringify(mediaToKeep));
      
      selectedFiles.forEach(file => {
        formData.append('media', file);
      });

      await axiosInstance.put(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("News updated successfully");
      navigate("/news");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCities();
    fetchNews();
  }, [id]);

  if (fetching) {
    return (
      <AdminLayout title="Loading">
        <p className="text-center text-slate-500 py-10 font-bold">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit News">
          <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Title Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      name="titleColor"
                      type="color"
                      value={form.titleColor || "#111827"}
                      onChange={handleChange}
                      className="h-12 w-16 rounded-xl border bg-white p-1"
                    />
                    <input
                      name="titleColor"
                      value={form.titleColor || "#111827"}
                      onChange={handleChange}
                      className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Title Font Size
                  </label>
                  <input
                    name="titleFontSize"
                    type="number"
                    min="10"
                    max="60"
                    value={form.titleFontSize}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Description Font Size
                  </label>
                  <input
                    name="descriptionFontSize"
                    type="number"
                    min="10"
                    max="40"
                    value={form.descriptionFontSize}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">App Preview</p>
                  <h3 className="mt-2 font-black" style={{ color: form.titleColor || "#111827", fontSize: `${form.titleFontSize || 22}px` }}>
                    {form.title || "News title preview"}
                  </h3>
                  <p className="mt-2 text-slate-600" style={{ fontSize: `${form.descriptionFontSize || 16}px` }}>
                    {form.description || "Description preview"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  City / Area News Target
                </label>
                <select
                  name="cities"
                  value={form.cities || []}
                  onChange={handleChange}
                  multiple
                  className="w-full border rounded-xl px-4 py-3 min-h-[130px] outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}{city.state?.name ? `, ${city.state.name}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl on Windows to select multiple cities. Leave empty for all cities/general news.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Reporter Name
                  </label>
                  <input
                    name="reporter.name"
                    value={form.reporter.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Reporter Avatar URL
                  </label>
                  <input
                    name="reporter.avatar"
                    value={form.reporter.avatar}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Existing Media Files
                </label>
                <div className="mb-4">
                  <MediaSlider
                    items={form.media || []}
                    title="Existing Media Preview"
                    emptyText="No existing media attached"
                    onRemove={(mediaItem) => removeExistingMedia(mediaItem._id)}
                    getKey={(mediaItem) => mediaItem._id}
                    getBadge={(mediaItem) => mediaItem.type || "media"}
                  />
                </div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">
                  Add New Media Files (Images, Videos, PDFs)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/ogg,application/pdf"
                  onChange={handleFileChange}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <MediaSlider
                      items={selectedFiles}
                      title="New Selected Media Preview"
                      emptyText="No new media selected"
                      onRemove={(_, index) => removeFile(index)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Hashtags
                </label>
                {form.hashtags.map((tag, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={tag}
                      onChange={(e) => handleArrayChange("hashtags", i, e.target.value)}
                      className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Hashtag"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("hashtags", i)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("hashtags")}
                  className="w-full py-2 border-2 border-dashed border-cyan-300 text-cyan-600 rounded-xl hover:border-cyan-400"
                >
                  + Add Hashtag
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="isBreaking"
                    name="isBreaking"
                    type="checkbox"
                    checked={form.isBreaking}
                    onChange={handleChange}
                    className="w-5 h-5 accent-cyan-500"
                  />
                  <label htmlFor="isBreaking" className="text-sm font-semibold text-slate-700">
                    Mark as Breaking News
                  </label>
                </div>

                {form.isBreaking && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Breaking News Display Text
                    </label>
                    <input
                      name="breakingText"
                      value={form.breakingText}
                      onChange={handleChange}
                      maxLength={80}
                      placeholder="Example: Breaking News, Big Update, Alert"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">This exact text will show in the app instead of fixed Breaking News text.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="font-bold text-slate-800">Display News In App</p>
                  <p className="text-xs text-slate-500">Turn off to save news now and show it later.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-cyan-500"
                  />
                  {form.isActive ? "On" : "Off"}
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Published Date
                </label>
                <input
                  name="publishedDate"
                  type="date"
                  value={form.publishedDate}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update News"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/news")}
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

export default EditNews;
