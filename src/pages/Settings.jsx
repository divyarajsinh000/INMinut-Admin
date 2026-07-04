import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { getFullMediaUrl } from "../components/MediaPreview";
import { FiUpload, FiImage } from "react-icons/fi";
import ImageCropModal from "../components/ImageCropModal";

const Settings = () => {
  const [settings, setSettings] = useState({
    appLogo: "",
    appIcon: "",
    defaultNewsImage: "",
    defaultShareImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({
    appLogo: null,
    appIcon: null,
    defaultNewsImage: null,
    defaultShareImage: null,
  });

  const [cropFile, setCropFile] = useState(null);
  const [activeCropField, setActiveCropField] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/settings");
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setCropFile(file);
        setActiveCropField(field);
      } else {
        setFiles((prev) => ({ ...prev, [field]: file }));
      }
    }
    // reset input so same file can be selected again
    e.target.value = "";
  };

  const handleCropDone = (croppedFile) => {
    setFiles((prev) => ({ ...prev, [activeCropField]: croppedFile }));
    setCropFile(null);
    setActiveCropField(null);
  };

  const handleUseOriginalImage = () => {
    setFiles((prev) => ({ ...prev, [activeCropField]: cropFile }));
    setCropFile(null);
    setActiveCropField(null);
  };

  const handleCancelCropImage = () => {
    setCropFile(null);
    setActiveCropField(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      if (files.appLogo) formData.append("appLogo", files.appLogo);
      if (files.appIcon) formData.append("appIcon", files.appIcon);
      if (files.defaultNewsImage) formData.append("defaultNewsImage", files.defaultNewsImage);
      if (files.defaultShareImage) formData.append("defaultShareImage", files.defaultShareImage);

      const res = await axiosInstance.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Settings updated successfully");
      if (res.data.settings) {
        setSettings(res.data.settings);
        setFiles({ appLogo: null, appIcon: null, defaultNewsImage: null, defaultShareImage: null });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const renderImageUpload = (title, field, description) => {
    const currentValue = settings[field];
    const pendingFile = files[field];
    const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : currentValue ? getFullMediaUrl(currentValue) : null;

    return (
      <div className="bg-white/90 rounded-[1.5rem] shadow-sm border border-red-100 p-6 flex gap-6 items-start">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 font-medium mb-4">{description}</p>
          
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
            <FiUpload />
            Choose New Image
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, field)}
            />
          </label>
        </div>
        
        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden shrink-0 relative">
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="w-full h-full object-contain p-2" />
          ) : (
            <>
              <FiImage className="text-3xl text-slate-300 mb-2" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">No Image</span>
            </>
          )}
          {pendingFile && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
              NEW
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="System Settings">
      <div className="max-w-4xl mx-auto pb-10">
        <div className="mb-6">
          <p className="text-slate-500 font-medium">Manage global images and settings used across the admin panel and frontend app.</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500 font-bold">Loading Settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {renderImageUpload(
              "App Logo",
              "appLogo",
              "Displayed in the header of the frontend app."
            )}
            {renderImageUpload(
              "App Icon",
              "appIcon",
              "App icon image used in the application."
            )}
            {renderImageUpload(
              "Default News Image",
              "defaultNewsImage",
              "Pre-filled placeholder image when you click 'Add News' in the admin panel."
            )}
            {renderImageUpload(
              "Default Share Image",
              "defaultShareImage",
              "Fallback image used when sharing a news article that has no images."
            )}

            <div className="flex justify-end pt-4 border-t border-red-100">
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {saving ? "Saving Changes..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>

      <ImageCropModal
        file={cropFile}
        title="Crop Image"
        aspect={undefined}
        onCropDone={handleCropDone}
        onUseOriginal={handleUseOriginalImage}
        onCancel={handleCancelCropImage}
      />
    </AdminLayout>
  );
};

export default Settings;
