import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AdminLayout title="Categories">
          <div className="flex justify-end mb-5">
            <Link
              to="/categories/add"
              className="flex items-center gap-2 bg-cyan-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-cyan-600"
            >
              <FiPlus />
              Add Category
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-slate-500">No categories yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white rounded-2xl shadow-sm border p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{
                          backgroundColor: cat.backgroundColor || "#FF6B35",
                          color: cat.textColor || "#FFFFFF",
                        }}
                      >
                        <span className="font-bold text-lg">{cat.name.charAt(0)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {cat.name}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/categories/edit/${cat._id}`}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                      >
                        <FiEdit className="text-slate-700" />
                      </Link>
                      <button
                        onClick={() => deleteCategory(cat._id)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </AdminLayout>
  );
};

export default CategoryList;
