import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiBell, FiLoader, FiMenu, FiSearch, FiX } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";

const Navbar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef(null);

  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = keyword.trim();

    if (!value) {
      if (location.pathname === "/news") navigate("/news");
      return;
    }

    navigate(`/news?search=${encodeURIComponent(value)}`);
  };

  const clearSearch = () => {
    setKeyword("");
    if (location.pathname === "/news") navigate("/news");
  };

  const loadNotifications = async () => {
    if (summary) return;

    try {
      setNotificationLoading(true);
      const res = await axiosInstance.get("/news/analytics/dashboard", { params: { limit: 3 } });
      setSummary(res.data?.data || null);
    } catch (error) {
      setSummary({ error: error?.response?.data?.message || "Unable to load notification summary" });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setNotificationOpen((prev) => !prev);
    loadNotifications();
  };

  const totals = summary?.totals || {};
  const topViewed = summary?.topNewsByViews || [];
  const hasImportantItems = Number(totals.breakingNews || 0) + Number(totals.pinnedNews || 0) > 0;

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 px-4 py-4 shadow-sm shadow-slate-200/60 backdrop-blur-2xl sm:px-5 lg:px-7 xl:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-cyan-200 hover:text-cyan-600 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="text-xl" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600">Admin Panel</p>
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-500 shadow-sm md:flex xl:min-w-[340px]">
            <FiSearch className="shrink-0" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search news title, hashtag, reporter..."
              className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
            />
            {keyword && (
              <button type="button" onClick={clearSearch} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search">
                <FiX />
              </button>
            )}
            <button type="submit" className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-black text-white hover:bg-cyan-600">
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/news")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-cyan-200 hover:text-cyan-600 md:hidden"
            aria-label="Open news search"
          >
            <FiSearch />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600 shadow-sm hover:bg-cyan-100"
              aria-label="Open notification summary"
            >
              <FiBell />
              {hasImportantItems && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
                <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
                  <p className="text-sm font-black text-slate-950">Admin notification summary</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Quick health check from analytics API.</p>
                </div>

                {notificationLoading ? (
                  <div className="flex items-center gap-2 p-4 text-sm font-bold text-slate-500">
                    <FiLoader className="animate-spin" /> Loading summary...
                  </div>
                ) : summary?.error ? (
                  <div className="p-4 text-sm font-bold text-red-600">{summary.error}</div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-black uppercase text-slate-400">Breaking</p>
                        <p className="text-xl font-black text-slate-950">{Number(totals.breakingNews || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-black uppercase text-slate-400">Pinned</p>
                        <p className="text-xl font-black text-slate-950">{Number(totals.pinnedNews || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-black uppercase text-slate-400">Guest users</p>
                        <p className="text-xl font-black text-slate-950">{Number(totals.totalGuestUsers || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-black uppercase text-slate-400">Notify on</p>
                        <p className="text-xl font-black text-slate-950">{Number(totals.notificationsEnabledUsers || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">Top viewed news</p>
                      {topViewed.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">No viewed news yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {topViewed.map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => {
                                setNotificationOpen(false);
                                navigate(`/news/edit/${item._id}`);
                              }}
                              className="w-full rounded-2xl bg-slate-50 p-3 text-left hover:bg-cyan-50"
                            >
                              <p className="line-clamp-1 text-sm font-black text-slate-800">{item.title}</p>
                              <p className="mt-1 text-xs font-bold text-slate-500">{Number(item.viewCount || 0).toLocaleString()} views</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/analytics");
                      }}
                      className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white hover:bg-cyan-600"
                    >
                      Open analytics
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-500 shadow-sm md:hidden">
        <FiSearch className="shrink-0" />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search news..."
          className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
        />
        {keyword && (
          <button type="button" onClick={clearSearch} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search">
            <FiX />
          </button>
        )}
        <button type="submit" className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-black text-white hover:bg-cyan-600">
          Go
        </button>
      </form>
    </header>
  );
};

export default Navbar;
