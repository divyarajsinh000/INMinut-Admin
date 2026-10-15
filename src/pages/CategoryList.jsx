import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";
import { FiPlus, FiEdit, FiTrash2, FiZap, FiEye, FiEyeOff } from "react-icons/fi";
import ToggleSwitch from "../components/ToggleSwitch";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories?includeHidden=true");
      setCategories(res.data.data);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id, currentIsVisible) => {
    const newStatus = !currentIsVisible;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isVisible: newStatus } : c))
    );
    try {
      await axiosInstance.put(`/categories/${id}`, { isVisible: newStatus });
      toast.success(`Category ${newStatus ? "visible" : "hidden"}`);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to toggle category visibility"));
      fetchCategories(); // Revert on failure
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete category"));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      return;
    }

    const newCategories = [...categories];
    const draggedItem = newCategories.splice(draggedIdx, 1)[0];
    newCategories.splice(targetIdx, 0, draggedItem);

    setCategories(newCategories);
    setDraggedIdx(null);

    try {
      const orderedIds = newCategories.map(cat => cat._id);
      await axiosInstance.put("/categories/reorder", { orderedIds });
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to reorder categories"));
      fetchCategories(); // revert on fail
    }
  };

  return (
    <AdminLayout title="Categories">
          <div className="flex justify-end mb-5">
            <Link
              to="/categories/add"
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-600"
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
              {categories.map((cat, index) => {
                const isCatVisible = cat.isVisible !== false;
                return (
                  <div
                    key={cat._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-white rounded-2xl shadow-sm border p-5 cursor-move transition-transform ${
                      draggedIdx === index ? 'opacity-50 scale-95' : ''
                    } ${!isCatVisible ? 'bg-slate-50/70 border-dashed' : ''}`}
                  >
                    <div className="flex justify-between items-start pointer-events-none">
                      <div>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${!isCatVisible ? 'opacity-50' : ''}`}
                          style={{
                            backgroundColor: cat.backgroundColor || "#FF6B35",
                            color: cat.textColor || "#FFFFFF",
                          }}
                        >
                          <span className="font-bold text-lg">{cat.name.charAt(0)}</span>
                        </div>
                        <h3 className={`text-xl font-bold mb-1 ${!isCatVisible ? 'text-slate-500' : 'text-slate-900'}`}>
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          {cat.isHighlighted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                              <FiZap /> Highlighted
                            </span>
                          )}
                          {!isCatVisible && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                              <FiEyeOff /> Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pointer-events-auto">
                        <ToggleSwitch
                          checked={isCatVisible}
                          onChange={() => toggleVisibility(cat._id, isCatVisible)}
                          title={isCatVisible ? "Hide category" : "Show category"}
                        />

                        <Link
                          to={`/categories/edit/${cat._id}`}
                          className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                          title="Edit Category"
                        >
                          <FiEdit className="text-slate-700" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat._id)}
                          className="p-2.5 bg-red-100 rounded-xl hover:bg-red-200 transition-colors"
                          title="Delete Category"
                        >
                          <FiTrash2 className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </AdminLayout>
  );
};

export default CategoryList;
