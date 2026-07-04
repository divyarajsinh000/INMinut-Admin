import { sanitizeRichText } from "../utils/sanitizeHtml";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFullMediaUrl, getMediaType } from "../components/MediaPreview";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import MediaSlider from "../components/MediaSlider";
import QuillEditor from "../components/QuillEditor";
import ImageCropModal from "../components/ImageCropModal";

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaToKeep, setMediaToKeep] = useState([]);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    titleLink: "",
    titleColor: "#111827",
    titleFontSize: 22,
    description: "",
    descriptionFontSize: 16,
    media: [],
    category: "",
    reporter: { name: "", avatar: "" },
    hashtags: [""],
    isBreaking: false,
    breakingText: "Breaking News",
    breakingBgColor: "#EF4444",
    breakingTextColor: "#FFFFFF",
    isBreakingBlink: false,
    isActive: true,
    hideReporter: false,
    publishedDate: new Date().toISOString().split("T")[0],
    cities: [],
  });

  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropQueue, setCropQueue] = useState([]);

  const keptVideos = form.media
    ? form.media.filter(m => getMediaType(m) === "video" && mediaToKeep.includes(m._id))
    : [];
  const selectedVideos = selectedFiles.filter(file => getMediaType(file) === "video");
  const videos = [
    ...keptVideos.map(v => ({ name: v.originalName || v.url.split("/").pop() })),
    ...selectedVideos.map(v => ({ name: v.name }))
  ];

  const keptPdfs = form.media
    ? form.media.filter(m => getMediaType(m) === "pdf" && mediaToKeep.includes(m._id))
    : [];
  const selectedPdfs = selectedFiles.filter(file => getMediaType(file) === "pdf");
  const pdfs = [
    ...keptPdfs.map(p => ({ name: p.originalName || p.url.split("/").pop() })),
    ...selectedPdfs.map(p => ({ name: p.name }))
  ];

  useEffect(() => {
    // Check if there are new selected files that are images
    const newImgFile = selectedFiles.find(file => {
      const type = getMediaType(file);
      return type === "image";
    });

    if (newImgFile) {
      const objectUrl = URL.createObjectURL(newImgFile);
      setPreviewImageUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    // Check if there are existing media files that are images
    if (form.media && form.media.length > 0) {
      const keptMedia = mediaToKeep ? form.media.filter(m => mediaToKeep.includes(m._id)) : form.media;
      const existingImg = keptMedia.find(m => {
        const type = getMediaType(m);
        return type === "image";
      });
      if (existingImg) {
        setPreviewImageUrl(getFullMediaUrl(existingImg.url));
        return;
      }
    }

    setPreviewImageUrl("");
  }, [selectedFiles, form.media, mediaToKeep]);

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
        titleLink: news.titleLink || "",
        titleColor: news.titleColor || "#111827",
        titleFontSize: news.titleFontSize || 22,
        descriptionFontSize: news.descriptionFontSize || 16,
        breakingText: news.breakingText || "Breaking News",
        breakingBgColor: news.breakingBgColor || "#EF4444",
        breakingTextColor: news.breakingTextColor || "#FFFFFF",
        isBreakingBlink: !!news.isBreakingBlink,
        isActive: news.isActive !== false,
        hideReporter: !!news.hideReporter,
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

  const showNextCropImage = () => {
    setCropQueue((prev) => {
      const [nextFile, ...remainingFiles] = prev;
      setCropFile(nextFile || null);
      return remainingFiles;
    });
  };

  const enqueueImageFilesForCrop = (imageFiles) => {
    if (!imageFiles.length) return;

    if (!cropFile) {
      const [firstFile, ...remainingFiles] = imageFiles;
      setCropFile(firstFile);
      if (remainingFiles.length) {
        setCropQueue((prev) => [...prev, ...remainingFiles]);
      }
      return;
    }

    setCropQueue((prev) => [...prev, ...imageFiles]);
  };

  const handleCropDone = (croppedFile) => {
    setSelectedFiles((prev) => [...prev, croppedFile]);
    showNextCropImage();
  };

  const handleUseOriginalImage = () => {
    if (cropFile) {
      setSelectedFiles((prev) => [...prev, cropFile]);
    }
    showNextCropImage();
  };

  const handleCancelCropImage = () => {
    showNextCropImage();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
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

    const imageFiles = validFiles.filter(file => file.type.startsWith('image/'));
    const otherFiles = validFiles.filter(file => !file.type.startsWith('image/'));

    if (otherFiles.length) {
      setSelectedFiles(prev => [...prev, ...otherFiles]);
    }

    enqueueImageFilesForCrop(imageFiles);
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
      formData.append('titleLink', form.titleLink || '');
      formData.append('titleColor', form.titleColor || '#111827');
      formData.append('titleFontSize', form.titleFontSize || 22);
      formData.append('description', form.description);
      formData.append('descriptionFontSize', form.descriptionFontSize || 16);
      formData.append('category', form.category);
      formData.append('hashtags', JSON.stringify(form.hashtags.filter((tag) => tag.trim())));
      formData.append('isBreaking', form.isBreaking);
      formData.append('breakingText', form.breakingText || 'Breaking News');
      formData.append('breakingBgColor', form.breakingBgColor || '#EF4444');
      formData.append('breakingTextColor', form.breakingTextColor || '#FFFFFF');
      formData.append('isBreakingBlink', form.isBreakingBlink);
      formData.append('isActive', form.isActive);
      formData.append('hideReporter', form.hideReporter);
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
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border p-6 w-full lg:max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title Link <span className="text-xs font-medium text-slate-400">(optional)</span>
                </label>
                <input
                  name="titleLink"
                  type="url"
                  value={form.titleLink || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/news-details"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs font-medium text-slate-400">
                  If link is added, the title becomes clickable. Leave empty to keep title normal.
                </p>
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
                      className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <div className="w-full bg-white">
                  <QuillEditor
                    value={form.description}
                    onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  />
                </div>
              </div>

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
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full border rounded-xl px-4 py-3 min-h-[130px] outline-none focus:ring-2 focus:ring-red-500"
                >
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}{city.state?.name ? `, ${city.state.name}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl on Windows to select multiple cities. Leave empty for all cities/general news.</p>
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
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
                      className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full py-2 border-2 border-dashed border-red-300 text-red-600 rounded-xl hover:border-red-400"
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
                    className="w-5 h-5 accent-red-500"
                  />
                  <label htmlFor="isBreaking" className="text-sm font-semibold text-slate-700">
                    Mark as Breaking News
                  </label>
                </div>

                {form.isBreaking && (
                  <div className="space-y-4 pt-2 border-t border-slate-200">
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
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">This exact text will show in the app instead of fixed Breaking News text.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            name="breakingBgColor"
                            value={form.breakingBgColor || '#EF4444'}
                            onChange={handleChange}
                            className="h-11 w-11 rounded-lg border cursor-pointer"
                          />
                          <input
                            type="text"
                            name="breakingBgColor"
                            value={form.breakingBgColor || '#EF4444'}
                            onChange={handleChange}
                            placeholder="#EF4444"
                            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            name="breakingTextColor"
                            value={form.breakingTextColor || '#FFFFFF'}
                            onChange={handleChange}
                            className="h-11 w-11 rounded-lg border cursor-pointer"
                          />
                          <input
                            type="text"
                            name="breakingTextColor"
                            value={form.breakingTextColor || '#FFFFFF'}
                            onChange={handleChange}
                            placeholder="#FFFFFF"
                            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        id="isBreakingBlink"
                        name="isBreakingBlink"
                        type="checkbox"
                        checked={form.isBreakingBlink}
                        onChange={handleChange}
                        className="w-5 h-5 accent-red-500"
                      />
                      <label htmlFor="isBreakingBlink" className="text-sm font-semibold text-slate-700">
                        Enable Blinking Animation for Badge
                      </label>
                    </div>
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
                    className="h-5 w-5 accent-red-500"
                  />
                  {form.isActive ? "On" : "Off"}
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="font-bold text-slate-800">Hide Reporter Info</p>
                  <p className="text-xs text-slate-500">Turn on to hide the reporter name and image in the app.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
                  <input
                    name="hideReporter"
                    type="checkbox"
                    checked={form.hideReporter}
                    onChange={handleChange}
                    className="h-5 w-5 accent-red-500"
                  />
                  {form.hideReporter ? "Hidden" : "Visible"}
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
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60"
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

        {/* Right Side: Live Preview */}
        <div className="w-full lg:w-[380px] space-y-4 shrink-0">
          <div className="bg-slate-100 rounded-[30px] p-4 border-4 border-slate-300 shadow-xl w-full">
            <div className="text-center mb-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">LIVE APP PREVIEW</span>
            </div>

            {/* The Phone/Card Outer Shell */}
            <div className="bg-white rounded-[24px] overflow-hidden shadow-md border border-slate-200 h-[620px] flex flex-col justify-between relative">
              
              {/* Scrollable Container for Card Content */}
              <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                
                {/* 1. Image/Media Section */}
                {previewImageUrl ? (
                  <div className="relative h-56 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />

                    {/* Breaking Badge overlay on Image */}
                    {form.isBreaking && (
                      <div
                        className="absolute top-0 left-0 flex items-center gap-1 px-3 py-1.5 font-black uppercase text-[10px] tracking-wider select-none"
                        style={{
                          backgroundColor: form.breakingBgColor || "#EF4444",
                          color: form.breakingTextColor || "#FFFFFF",
                          borderTopLeftRadius: "20px",
                          borderBottomRightRadius: "14px",
                          animation: form.isBreakingBlink ? "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
                        }}
                      >
                        <span style={{ color: "#FACC15" }}>⚡</span>
                        <span>{form.breakingText || "Breaking"}</span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Card Content Area */}
                <div className="p-4">
                  {/* Category and Date Row */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: categories.find((cat) => cat._id === form.category)?.backgroundColor || "#E2E8F0",
                        color: categories.find((cat) => cat._id === form.category)?.textColor || "#475569",
                      }}
                    >
                      {categories.find((cat) => cat._id === form.category)?.name || "Category"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {form.publishedDate ? new Date(form.publishedDate).toLocaleDateString() : "Today"}
                    </span>
                  </div>

                  {/* Inline Breaking Badge (when no image) */}
                  {!previewImageUrl && form.isBreaking && (
                    <div
                      className="inline-flex items-center gap-1 px-3 py-1.5 font-black uppercase text-[10px] tracking-wider mb-2.5"
                      style={{
                        backgroundColor: form.breakingBgColor || "#EF4444",
                        color: form.breakingTextColor || "#FFFFFF",
                        borderTopLeftRadius: "12px",
                        borderBottomRightRadius: "12px",
                        borderTopRightRadius: "4px",
                        borderBottomLeftRadius: "4px",
                        animation: form.isBreakingBlink ? "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
                      }}
                    >
                      <span style={{ color: "#FACC15" }}>⚡</span>
                      <span>{form.breakingText || "Breaking"}</span>
                    </div>
                  )}

                  {/* News Title */}
                  {form.titleLink ? (
                    <a
                      href={form.titleLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-2 block font-black leading-tight tracking-tight line-clamp-2 underline decoration-red-400 underline-offset-4"
                      style={{
                        color: form.titleColor || "#111827",
                        fontSize: `${form.titleFontSize || 20}px`,
                      }}
                    >
                      {form.title || "News Title Preview"}
                    </a>
                  ) : (
                    <h3
                      className="font-black leading-tight mb-2 tracking-tight line-clamp-2"
                      style={{
                        color: form.titleColor || "#111827",
                        fontSize: `${form.titleFontSize || 20}px`,
                      }}
                    >
                      {form.title || "News Title Preview"}
                    </h3>
                  )}

                  {/* News Description */}
                  <div className="mb-2">
                    <div
                      className={`text-slate-600 font-medium ql-editor !p-0 ${previewExpanded ? "" : "line-clamp-[5] text-ellipsis overflow-hidden"}`}
                      style={{
                        fontSize: `${form.descriptionFontSize || 14}px`,
                        lineHeight: 1.45,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichText(form.description || "<p>News description preview will show here...</p>"),
                      }}
                    />
                    {form.description && (
                      <button
                        type="button"
                        onClick={() => setPreviewExpanded(!previewExpanded)}
                        className="text-[11px] font-black text-[#F97316] mt-1 hover:underline focus:outline-none"
                      >
                        {previewExpanded ? "Read less" : "... Read more"}
                      </button>
                    )}
                  </div>

                  {/* Videos Preview */}
                  {videos.map((vid, idx) => (
                    <div key={`vid-${idx}`} className="w-full h-40 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center text-white my-3 shrink-0 select-none">
                      <span className="absolute top-2 left-2 bg-black/60 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Video</span>
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white backdrop-blur-sm">
                        <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="absolute bottom-2 left-3 text-[10px] truncate max-w-[85%] font-bold text-slate-300">
                        {vid.name || "Video attachment"}
                      </span>
                    </div>
                  ))}

                  {/* PDFs Preview */}
                  {pdfs.map((pdf, idx) => (
                    <div key={`pdf-${idx}`} className="w-full flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl my-3 text-red-950 shrink-0">
                      <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate">{pdf.name || "Document.pdf"}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">PDF Document</p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* Card Footer (Reporter & Actions) */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center justify-between">
                  {/* Reporter Info */}
                  {!form.hideReporter && (form.reporter?.name?.trim() || form.reporter?.avatar?.trim()) ? (
                    <div className="flex items-center gap-2 max-w-[60%]">
                      {form.reporter?.avatar?.trim() && (
                        <img
                          src={getFullMediaUrl(form.reporter.avatar)}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                      )}
                      {form.reporter?.name?.trim() && (
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {form.reporter.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Share Button */}
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 10.742l4.685-2.618m0 5.748L8.684 13.26m5.916-7.38c1.332 0 2.41 1.078 2.41 2.41 0 1.333-1.078 2.41-2.41 2.41-1.333 0-2.41-1.078-2.41-2.41 0-1.332 1.077-2.41 2.41-2.41zm0 9.782c1.332 0 2.41 1.078 2.41 2.41 0 1.333-1.078 2.41-2.41 2.41-1.333 0-2.41-1.078-2.41-2.41 0-1.332 1.077-2.41 2.41-2.41z" />
                      </svg>
                    </div>
                    {/* Save Button */}
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ImageCropModal
        file={cropFile}
        title="Crop News Image"
        aspect={undefined}
        onCropDone={handleCropDone}
        onUseOriginal={handleUseOriginalImage}
        onCancel={handleCancelCropImage}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default EditNews;
