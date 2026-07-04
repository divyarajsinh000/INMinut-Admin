import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import {
  clearAdminToken,
  getAdminToken,
  migrateLegacyToken,
  setAdminToken,
} from "../utils/authStorage";

const AuthContext = createContext();
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = (showMessage = false) => {
    clearAdminToken();
    setUser(null);
    if (showMessage) toast.info("Your admin session has ended. Please sign in again.");
  };

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get("/admin/me");
      setUser(res.data.data);
    } catch {
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    migrateLegacyToken();
    if (getAdminToken()) checkAuth();
    else setLoading(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => logout(true);
    window.addEventListener("admin-session-expired", handleExpired);
    return () => window.removeEventListener("admin-session-expired", handleExpired);
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    let timer;
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => logout(true), IDLE_TIMEOUT_MS);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/admin/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const { token, ...userData } = res.data.data;
      if (!token) throw new Error("Login response did not include a token.");
      setAdminToken(token);
      setUser(userData);
      toast.success("Login successful");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
