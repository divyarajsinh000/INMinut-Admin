import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    backgroundColor: "#FF6B35",
    textColor: "#FFFFFF",
    isHighlighted: false,
    isVisible: true,
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/categories", form);
      toast.success("Category added successfully");
      navigate("/categories");
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to add category"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Category">
          <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    name="backgroundColor"
                    type="color"
                    value={form.backgroundColor}
                    onChange={handleChange}
                    className="w-20 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    value={form.backgroundColor}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    name="textColor"
                    type="color"
                    value={form.textColor}
                    onChange={handleChange}
                    className="w-20 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    value={form.textColor}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        textColor: e.target.value,
                      }))
                    }
                    className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 cursor-pointer">
                <input
                  name="isHighlighted"
                  type="checkbox"
                  checked={form.isHighlighted}
                  onChange={(e) => setForm((prev) => ({ ...prev, isHighlighted: e.target.checked }))}
                  className="h-5 w-5 accent-amber-500"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">Highlight / Blink this category</span>
                  <span className="block text-xs text-slate-600 mt-1">It will pulse in the mobile app to draw attention.</span>
                </span>
              </label>

              <div
                onClick={() => setForm((prev) => ({ ...prev, isVisible: !prev.isVisible }))}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 cursor-pointer hover:bg-slate-100/80 transition-all select-none"
              >
                <div>
                  <span className="block text-sm font-bold text-slate-800">Show / Hide Category</span>
                  <span className="block text-xs text-slate-600 mt-1">Controls whether this category is visible in the app.</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm shrink-0">
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                      form.isVisible ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className={`text-sm font-bold ${form.isVisible ? "text-emerald-700" : "text-slate-500"}`}>
                    {form.isVisible ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Add Category"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/categories")}
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

export default AddCategory;
