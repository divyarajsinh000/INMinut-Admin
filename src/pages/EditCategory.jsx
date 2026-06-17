import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    backgroundColor: "#FF6B35",
    textColor: "#FFFFFF",
  });

  const fetchCategory = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      const cat = res.data.data.find((c) => c._id === id);
      if (cat) setForm(cat);
    } catch (error) {
      toast.error("Failed to load category");
    } finally {
      setFetching(false);
    }
  };

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
      await axiosInstance.put(`/categories/${id}`, form);
      toast.success("Category updated successfully");
      navigate("/categories");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  if (fetching) {
    return (
      <AdminLayout title="Loading">
        <p className="text-center text-slate-500 py-10 font-bold">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Category">
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update Category"}
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

export default EditCategory;
