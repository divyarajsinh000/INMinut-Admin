import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin");
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout title="Users">
          <div className="flex justify-end mb-5">
            <Link
              to="/users/add"
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-600"
            >
              <FiPlus />
              Add User
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-500">No users yet</p>
          ) : (
            <div className="grid gap-4">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="bg-white rounded-2xl shadow-sm border p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{u.name}</h3>
                    <p className="text-slate-500">{u.email}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        u.role === "super-admin"
                          ? "bg-red-100 text-red-600"
                          : u.role === "reporter"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role === "super-admin" ? "Super Admin" : u.role === "reporter" ? "Reporter" : "Editor"}
                    </span>
                  </div>

                  {user._id !== u._id && (
                    <div className="flex gap-2">
                      <Link
                        to={`/users/edit/${u._id}`}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                      >
                        <FiEdit className="text-slate-700" />
                      </Link>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </AdminLayout>
  );
};

export default Users;
