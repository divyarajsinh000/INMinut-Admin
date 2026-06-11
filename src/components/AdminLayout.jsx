import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30rem),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_28rem),linear-gradient(135deg,#f8fafc_0%,#eef2ff_46%,#fdf2f8_100%)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="min-h-screen lg:ml-72">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-7 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
