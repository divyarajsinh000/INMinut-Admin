import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { getFullMediaUrl } from "../components/MediaPreview";
import { FiCamera, FiMail, FiUser, FiKey, FiShield } from "react-icons/fi";
import ImageCropModal from "../components/ImageCropModal";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cropFile, setCropFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
      if (user.profileImage) {
        setPreviewUrl(getFullMediaUrl(user.profileImage));
      }
    }
  }, [user]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        e.target.value = "";
        return;
      }
      setCropFile(file);
      e.target.value = "";
    }
  };

  const handleCropDone = (croppedFile) => {
    setSelectedFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setCropFile(null);
  };

  const handleUseOriginalImage = () => {
    if (!cropFile) return;
    setSelectedFile(cropFile);
    setPreviewUrl(URL.createObjectURL(cropFile));
    setCropFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password) {
        formData.append("password", form.password);
      }
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const res = await axiosInstance.put("/admin/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.data);
      setForm((prev) => ({ ...prev, password: "" }));
      setSelectedFile(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="My Profile">
      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Profile Image</h2>
            <div className="relative group w-44 h-44 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <FiUser size={64} />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
              >
                <FiCamera size={26} className="mb-1" />
                <span className="text-xs font-black uppercase tracking-wider">Change Image</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {selectedFile && (
              <p className="mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                New image selected
              </p>
            )}
            <p className="text-xs text-slate-400 mt-4 text-center">
              Recommended: Square JPG or PNG. Max size 2MB.
            </p>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Personal Details</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FiUser size={16} className="text-slate-400" />
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FiMail size={16} className="text-slate-400" />
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FiShield size={16} className="text-slate-400" />
                    Account Role
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 font-semibold uppercase tracking-wider text-xs flex items-center select-none">
                    {user?.role || "editor"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FiKey size={16} className="text-slate-400" />
                    New Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-60 shrink-0"
                >
                  {loading ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ImageCropModal
        file={cropFile}
        title="Crop Profile Image"
        aspect={1}
        cropShape="round"
        onCropDone={handleCropDone}
        onUseOriginal={handleUseOriginalImage}
        onCancel={() => setCropFile(null)}
      />
    </AdminLayout>
  );
};

export default Profile;
