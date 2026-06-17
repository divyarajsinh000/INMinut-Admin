import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import MediaPreview from "../components/MediaPreview";
import ImageCropModal from "../components/ImageCropModal";

const AddAdvertisement = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [cropFile, setCropFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    label: "Advertisement",
    redirectUrl: "",
    cities: [],
    positionAfterNews: 4,
    isEnabled: true,
  });

  const fetchCities = async () => {
    try {
      const res = await axiosInstance.get("/locations/cities");
      setCities(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load cities");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "cities") {
      const values = Array.from(e.target.selectedOptions).map((option) => option.value);
      setForm((prev) => ({ ...prev, cities: values }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select only image file");
      e.target.value = "";
      return;
    }

    setCropFile(file);
    e.target.value = "";
  };

  const handleCropDone = (croppedFile) => {
    setBannerImage(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setCropFile(null);
  };

  const handleUseOriginalImage = () => {
    if (!cropFile) return;
    setBannerImage(cropFile);
    setPreview(URL.createObjectURL(cropFile));
    setCropFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bannerImage) {
      toast.error("Banner image is required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("label", form.label);
      formData.append("redirectUrl", form.redirectUrl);
      formData.append("cities", JSON.stringify(form.cities || []));
      formData.append("positionAfterNews", form.positionAfterNews);
      formData.append("isEnabled", form.isEnabled);
      formData.append("bannerImage", bannerImage);

      await axiosInstance.post("/advertisements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Advertisement added successfully");
      navigate("/advertisements");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add advertisement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <AdminLayout title="Add Advertisement">
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Label</label>
            <input name="label" value={form.label} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Redirect URL</label>
            <input name="redirectUrl" value={form.redirectUrl} onChange={handleChange} required placeholder="https://example.com" className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cities</label>
            <select
              name="cities"
              value={form.cities || []}
              onChange={handleChange}
              multiple
              className="w-full min-h-36 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            >
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl on Windows to select multiple cities. Leave empty to show this ad to all city users.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Show after how many news?</label>
            <input name="positionAfterNews" type="number" min="0" value={form.positionAfterNews} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-xs text-slate-500 mt-1">Set to 0 to show at the very top of the feed, or 4 to show after the 4th news card.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange}  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
            {preview && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <MediaPreview src={preview} type="image" name={bannerImage?.name || "Advertisement banner"} showName className="h-72" />
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Use crop before saving. You can also use original image from crop popup.
                </p>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input name="isEnabled" type="checkbox" checked={form.isEnabled} onChange={handleChange} className="w-5 h-5 accent-red-500" />
            <span className="text-sm font-semibold text-slate-700">Enable advertisement</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60">
              {loading ? "Saving..." : "Add Advertisement"}
            </button>
            <button type="button" onClick={() => navigate("/advertisements")} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        file={cropFile}
        title="Crop Advertisement Banner"
        aspect={16 / 9}
        cropShape="rect"
        onCropDone={handleCropDone}
        onUseOriginal={handleUseOriginalImage}
        onCancel={() => setCropFile(null)}
      />
    </AdminLayout>
  );
};

export default AddAdvertisement;
