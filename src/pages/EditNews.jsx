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
        <div className="w-full shrink-0 space-y-4 lg:sticky lg:top-5 lg:w-[390px]">
          <div className="w-full rounded-[30px] border-4 border-slate-300 bg-slate-100 p-4 shadow-xl">
            <div className="mb-2 text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Live app preview</span>
            </div>

            <div className="h-[690px] overflow-y-auto rounded-[24px] bg-[#F8FAFC] p-2 custom-scrollbar">
              <div className="mb-[10px] overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_28px_rgba(14,165,233,0.14)]">
                {previewImageUrl && (
                  <div className="relative w-full overflow-hidden bg-white" style={{ height: 300 }}>
                    <img src={previewImageUrl} alt="Preview" className="h-full w-full scale-[1.015] object-cover object-center" />

                    {form.isBreaking && (
                      <div
                        className="absolute left-0 top-0 flex items-center gap-[5px] rounded-br-[18px] rounded-tl-[23px] px-[15px] py-2 text-[11px] font-black uppercase tracking-[0.8px]"
                        style={{
                          backgroundColor: form.breakingBgColor || '#EF4444',
                          color: form.breakingTextColor || '#FFFFFF',
                          animation: form.isBreakingBlink ? 'pulse 1.6s ease-in-out infinite' : 'none',
                        }}
                      >
                        <span className="text-[13px]">⚡</span>
                        <span>{form.breakingText?.trim() || 'Breaking'}</span>
                      </div>
                    )}

                    {selectedFiles.filter((file) => getMediaType(file) === 'image').length + (form.media || []).filter((media) => mediaToKeep.includes(media._id) && getMediaType(media) === 'image').length > 1 && (
                      <div className="absolute bottom-[14px] left-0 right-0 flex justify-center gap-[6px]">
                        <span className="h-[7px] w-5 rounded-full bg-[#F97316]" />
                        {Array.from({ length: Math.min(4, selectedFiles.filter((file) => getMediaType(file) === 'image').length + (form.media || []).filter((media) => mediaToKeep.includes(media._id) && getMediaType(media) === 'image').length - 1) }).map((_, index) => (
                          <span key={index} className="h-[7px] w-[7px] rounded-full bg-white/70" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-[10px] flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[7px] pr-1">
                      <span
                        className="shrink-0 rounded-full px-[11px] py-[5px] text-[11px] font-black uppercase"
                        style={{
                          backgroundColor: categories.find((cat) => cat._id === form.category)?.backgroundColor || '#F97316',
                          color: categories.find((cat) => cat._id === form.category)?.textColor || '#FFFFFF',
                        }}
                      >
                        {categories.find((cat) => cat._id === form.category)?.name || 'News'}
                      </span>

                      {(form.cities || []).map((cityId) => {
                        const city = cities.find((entry) => entry._id === cityId);
                        if (!city) return null;
                        return (
                          <span key={cityId} className="inline-flex max-w-full items-center gap-[3px] rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-1 text-[11px] font-extrabold leading-[14px] text-[#0F3D8E]">
                            <svg className="h-3 w-3 shrink-0 text-[#F97316]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            <span className="truncate">{city.name}</span>
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 pt-1 text-[12px] font-bold text-slate-400">
                      <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                      <span>{form.publishedDate ? new Date(`${form.publishedDate}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}</span>
                    </div>
                  </div>

                  {form.isBreaking && !previewImageUrl && (
                    <div
                      className="mb-3 inline-flex items-center gap-[5px] rounded-bl-md rounded-br-[16px] rounded-tl-[16px] rounded-tr-md px-[14px] py-[7px] text-[11px] font-black uppercase tracking-[0.8px]"
                      style={{
                        backgroundColor: form.breakingBgColor || '#EF4444',
                        color: form.breakingTextColor || '#FFFFFF',
                        animation: form.isBreakingBlink ? 'pulse 1.6s ease-in-out infinite' : 'none',
                      }}
                    >
                      <span className="text-[13px]">⚡</span>
                      <span>{form.breakingText?.trim() || 'Breaking'}</span>
                    </div>
                  )}

                  {form.titleLink ? (
                    <a
                      href={form.titleLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-2 block font-black no-underline"
                      style={{
                        color: form.titleColor || '#0F3D8E',
                        fontSize: `${Math.min(34, Math.max(14, Number(form.titleFontSize) || 20))}px`,
                        lineHeight: 1.28,
                        fontFamily: 'Hind Vadodara, system-ui, sans-serif',
                      }}
                    >
                      {form.title || 'News Title Preview'} <span className="text-[#F97316]">↗</span>
                    </a>
                  ) : (
                    <h3
                      className="mb-2 font-black"
                      style={{
                        color: form.titleColor || '#0F3D8E',
                        fontSize: `${Math.min(34, Math.max(14, Number(form.titleFontSize) || 20))}px`,
                        lineHeight: 1.28,
                        fontFamily: 'Hind Vadodara, system-ui, sans-serif',
                      }}
                    >
                      {form.title || 'News Title Preview'}
                    </h3>
                  )}

                  <div className="mb-3">
                    <div
                      className={`ql-editor !p-0 font-semibold text-slate-600 ${previewExpanded ? '' : 'line-clamp-[5] overflow-hidden'}`}
                      style={{
                        fontSize: `${Math.min(28, Math.max(12, Number(form.descriptionFontSize) || 14))}px`,
                        lineHeight: 1.45,
                        fontFamily: 'Hind Vadodara, system-ui, sans-serif',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichText(form.description || '<p>News description preview will show here...</p>'),
                      }}
                    />
                    {form.description && (
                      <button type="button" onClick={() => setPreviewExpanded((value) => !value)} className="mt-1 inline-flex items-center gap-1 text-[13px] font-black text-[#F97316]">
                        {previewExpanded ? 'Read less' : '... Read more'}
                        <span>{previewExpanded ? '⌃' : ''}</span>
                      </button>
                    )}
                  </div>

                  {videos.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {videos.map((video, index) => (
                        <div key={`video-${index}`} className="relative flex h-40 items-center justify-center overflow-hidden rounded-[18px] bg-slate-900 text-white">
                          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black uppercase">Video</span>
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/20 text-xl">▶</span>
                          <span className="absolute bottom-3 left-3 right-3 truncate text-[11px] font-bold text-slate-200">{video.name || 'Video attachment'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {pdfs.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {pdfs.map((pdf, index) => (
                        <div key={`pdf-${index}`} className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-lg text-orange-600">📄</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-extrabold text-slate-900">{pdf.name || 'Document.pdf'}</p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">PDF document</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.hashtags?.filter((tag) => tag.trim()).length > 0 && (
                    <div className="mb-[14px] flex flex-wrap gap-2">
                      {form.hashtags.filter((tag) => tag.trim()).slice(0, previewExpanded ? undefined : 3).map((tag, index) => (
                        <span key={`${tag}-${index}`} className="rounded-full bg-[#EFF6FF] px-[9px] py-[5px] text-[12px] font-extrabold text-[#0F3D8E]">#{tag.replace(/^#/, '')}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-[10px]">
                    {!form.hideReporter && (form.reporter?.name?.trim() || form.reporter?.avatar?.trim()) && (
                    <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                      {form.reporter?.avatar?.trim() && <img src={getFullMediaUrl(form.reporter.avatar)} alt="Reporter" className="h-[34px] w-[34px] shrink-0 rounded-full object-cover" />}
                      {form.reporter?.name?.trim() && <span className="truncate text-[13px] font-extrabold text-slate-900">{form.reporter.name}</span>}
                    </div>
                  )}
                    <div className="ml-auto flex shrink-0 gap-2">
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[14px] border border-[#25D366] bg-[#25D366] text-white">
                        <span className="text-[19px] font-black">◉</span>
                      </div>
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] text-slate-900">
                        <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/></svg>
                      </div>
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] text-slate-900">
                        <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/></svg>
                      </div>
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] text-slate-900">
                        <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 000-7.8z"/></svg>
                      </div>
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
