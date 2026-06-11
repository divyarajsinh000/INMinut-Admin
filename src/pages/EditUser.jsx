import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "editor",
    password: "",
  });

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get(`/admin/${id}`);
      setForm({
        name: res.data.data.name,
        email: res.data.data.email,
        role: res.data.data.role,
        password: "",
      });
    } catch (error) {
      toast.error("Failed to load user");
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
      const data = { ...form };
      if (!data.password) delete data.password;
      await axiosInstance.put(`/admin/${id}`, data);
      toast.success("User updated successfully");
      navigate("/users");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (fetching) {
    return (
      <AdminLayout title="Loading">
        <p className="text-center text-slate-500 py-10 font-bold">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit User">
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
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  New Password (leave empty to keep current)
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="editor">Editor</option>
                  <option value="reporter">Reporter</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/users")}
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

export default EditUser;
