import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiCalendar,
  FiMove,
  FiStar,
  FiEye,
  FiBookmark,
  FiShare2,
  FiBarChart2,
  FiX,
  FiExternalLink,
  FiHeart,
  FiSearch,
  FiUser,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import MediaPreview, { getMediaType } from "../components/MediaPreview";

const FILTERS = [
  { key: "manual", label: "Manual / pinned", helper: "All news" },
  { key: "views", label: "Most viewed", helper: "Only news with views" },
  { key: "saves", label: "Most saved", helper: "Only news with saves" },
  { key: "shares", label: "Most shared", helper: "Only news with shares" },
];

const getPrimaryMedia = (item) => (Array.isArray(item?.media) && item.media.length > 0 ? item.media[0] : null);
const stripHtml = (html) => (html || "").replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();

const isCanceledRequest = (error) =>
  error?.code === "ERR_CANCELED" ||
  error?.name === "CanceledError" ||
  error?.message === "canceled";

const formatNewsDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const dateFormatted = d.toLocaleDateString();
  const timeFormatted = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dateFormatted}, ${timeFormatted}`;
};




const NewsList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";
  const adminQuery = searchParams.get("adminId")?.trim() || "";
  const dateQuery = searchParams.get("date")?.trim() || "";
  const isReporter = user?.role === "reporter";

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState(null);
  const [analyticsTotals, setAnalyticsTotals] = useState({ totalViews: 0, totalSaves: 0, totalShares: 0, totalNews: 0 });
  const [sortBy, setSortBy] = useState("manual");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNewsCount, setTotalNewsCount] = useState(0);

  // Multi-filter inputs state
  const [titleFilter, setTitleFilter] = useState(searchQuery);
  const [adminFilter, setAdminFilter] = useState(adminQuery);
  const [dateFilter, setDateFilter] = useState(dateQuery);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    setTitleFilter(searchQuery);
    setAdminFilter(adminQuery);
    setDateFilter(dateQuery);
  }, [searchQuery, adminQuery, dateQuery]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axiosInstance.get("/admins");
        if (Array.isArray(res.data?.data)) {
          setAdmins(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin users list:", err);
      }
    };
    fetchAdmins();
  }, []);

  const getApiSortKey = (value) => {
    if (value === "views") return "viewCount";
    if (value === "saves") return "saveCount";
    if (value === "shares") return "shareCount";
    return "manual";
  };

  const fetchNews = async (
    activeSort = sortBy,
    activeSearch = searchQuery,
    activeAdmin = adminQuery,
    activeDate = dateQuery,
    activePage = page,
    activeLimit = limit
  ) => {
    try {
      setLoading(true);
      const safeSort = isReporter ? "manual" : activeSort;
      const apiSortKey = getApiSortKey(safeSort);
      const commonParams = {
        ...(activeSearch ? { search: activeSearch } : {}),
        ...(activeAdmin ? { adminId: activeAdmin } : {}),
        ...(activeDate ? { date: activeDate } : {}),
        includeInactive: true,
        page: activePage,
        limit: activeLimit,
      };

      const [newsRes, analyticsRes] = await Promise.all([
        safeSort === "manual"
          ? axiosInstance.get("/news", { params: commonParams })
          : axiosInstance.get("/news/analytics/summary", {
              params: {
                ...commonParams,
                sortBy: apiSortKey,
                onlyWithMetric: true,
              },
            }),
        isReporter ? Promise.resolve(null) : axiosInstance.get("/news/analytics/summary", { params: { includeInactive: true } }).catch(() => null),
      ]);

      const newsData = safeSort === "manual"
        ? newsRes.data.data || []
        : newsRes.data.data?.news || [];

      const paginationInfo = safeSort === "manual"
        ? newsRes.data.pagination
        : newsRes.data.data?.pagination;

      setNews(newsData);

      if (paginationInfo) {
        setTotalPages(paginationInfo.totalPages || 1);
        setTotalNewsCount(paginationInfo.total || newsData.length);
      } else {
        setTotalPages(1);
        setTotalNewsCount(newsData.length);
      }

      if (analyticsRes?.data?.data?.totals) {
        setAnalyticsTotals(analyticsRes.data.data.totals);
      } else {
        setAnalyticsTotals({
          totalNews: paginationInfo?.total || newsData.length,
          totalViews: newsData.reduce((sum, item) => sum + Number(item.viewCount || 0), 0),
          totalSaves: newsData.reduce((sum, item) => sum + Number(item.saveCount || 0), 0),
          totalShares: newsData.reduce((sum, item) => sum + Number(item.shareCount || 0), 0),
        });
      }
    } catch (error) {
      if (!isCanceledRequest(error)) {
        toast.error(formatErrorMessage(error, "Failed to load news"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    const nextParams = new URLSearchParams(searchParams);

    if (titleFilter.trim()) nextParams.set("search", titleFilter.trim());
    else nextParams.delete("search");

    if (adminFilter.trim()) nextParams.set("adminId", adminFilter.trim());
    else nextParams.delete("adminId");

    if (dateFilter.trim()) nextParams.set("date", dateFilter.trim());
    else nextParams.delete("date");

    setSearchParams(nextParams);
  };

  const removeSingleFilter = (key) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setTitleFilter("");
    setAdminFilter("");
    setDateFilter("");
    setPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("adminId");
    nextParams.delete("date");
    setSearchParams(nextParams);
  };

  const getSelectedAdminName = (id) => {
    const found = admins.find((a) => a._id === id);
    return found ? `${found.name || found.email} (${found.role})` : id;
  };

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  const deleteNews = async (id) => {
    if (isReporter) return;
    if (!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      await axiosInstance.delete(`/news/${id}`);
      toast.success("News deleted");
      fetchNews(sortBy, searchQuery, adminQuery, dateQuery, page, limit);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete news"));
    }
  };

  const togglePin = async (id) => {
    if (isReporter) return;
    try {
      await axiosInstance.patch(`/news/${id}/toggle-pin`);
      toast.success("News pin status updated");
      fetchNews(sortBy, searchQuery, adminQuery, dateQuery, page, limit);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to update pin status"));
    }
  };

  const toggleActive = async (item) => {
    if (isReporter || togglingActiveId) return;

    const isCurrentlyActive = item?.isActive !== false;
    if (
      isCurrentlyActive &&
      !window.confirm(
        "Are you sure you want to turn this news off? It will be hidden from the public app."
      )
    ) {
      return;
    }

    const id = item._id;

    try {
      setTogglingActiveId(id);
      const res = await axiosInstance.patch(`/news/${id}/toggle-active`);
      const updatedNews = res.data?.data;

      if (updatedNews?._id) {
        setNews((prev) => prev.map((item) => (item._id === id ? { ...item, ...updatedNews } : item)));
      } else {
        setNews((prev) => prev.map((item) => (item._id === id ? { ...item, isActive: item.isActive === false } : item)));
      }

      toast.success(res.data?.message || "News visibility updated");
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to update news visibility"));
    } finally {
      setTogglingActiveId(null);
    }
  };

  const saveOrder = async (updatedNews) => {
    if (isReporter) return;
    try {
      setSavingOrder(true);
      await axiosInstance.patch("/news/reorder", {
        orderedIds: updatedNews.map((item) => item._id),
      });
      toast.success("News order updated");
      fetchNews(sortBy, searchQuery, adminQuery, dateQuery, page, limit);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to save news order"));
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (targetId) => {
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = news.findIndex((item) => item._id === draggedId);
    const targetIndex = news.findIndex((item) => item._id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const updatedNews = [...news];
    const [draggedItem] = updatedNews.splice(draggedIndex, 1);
    updatedNews.splice(targetIndex, 0, draggedItem);

    setNews(updatedNews);
    setDraggedId(null);
    saveOrder(updatedNews);
  };

  useEffect(() => {
    setPage(1);
  }, [sortBy, searchQuery, adminQuery, dateQuery]);

  useEffect(() => {
    fetchNews(sortBy, searchQuery, adminQuery, dateQuery, page, limit);
  }, [sortBy, searchQuery, adminQuery, dateQuery, page, limit]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilter = FILTERS.find((item) => item.key === sortBy) || FILTERS[0];

  const statCards = [
    { label: "Total views", value: analyticsTotals.totalViews, icon: FiEye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total saves", value: analyticsTotals.totalSaves, icon: FiBookmark, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total shares", value: analyticsTotals.totalShares, icon: FiShare2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total news", value: analyticsTotals.totalNews || totalNewsCount || news.length, icon: FiBarChart2, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <AdminLayout title="News">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Published stories</h2>
          <p className="mt-1 font-medium text-slate-500">
            {isReporter
              ? "Create news and edit only the news created by your reporter account."
              : "Create, edit, drag to reorder, pin important news and filter by live analytics from API."}
          </p>
          {savingOrder && <p className="mt-2 text-xs font-black text-cyan-600">Saving new order...</p>}
        </div>
        <Link to="/news/add" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700">
          <FiPlus /> Add News
        </Link>
      </div>

      {/* Title + Admin + Date Multi-Filter Search Bar */}
      <div className="mb-6 rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
          {/* Title / Keyword Input */}
          <div className="lg:col-span-4">
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Title / Keyword</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-500 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-500/20">
              <FiSearch className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Search title, description..."
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-0"
              />
              {titleFilter && (
                <button type="button" onClick={() => setTitleFilter("")} className="text-slate-400 hover:text-slate-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Admin / Reporter Creator Dropdown */}
          <div className="lg:col-span-3">
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Admin / Reporter</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-500 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-500/20">
              <FiUser className="shrink-0 text-slate-400" />
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer"
              >
                <option value="">All Admins & Reporters</option>
                {admins.map((adm) => (
                  <option key={adm._id} value={adm._id}>
                    {adm.name || adm.email} ({adm.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Published Date Filter */}
          <div className="lg:col-span-3">
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Published Date</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-500 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-500/20">
              <FiCalendar className="shrink-0 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer"
              />
              {dateFilter && (
                <button type="button" onClick={() => setDateFilter("")} className="text-slate-400 hover:text-slate-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex items-end gap-2 lg:col-span-2 lg:h-full lg:pt-5">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-600 transition"
            >
              <FiSearch size={16} /> Search
            </button>
            {(searchQuery || adminQuery || dateQuery || titleFilter || adminFilter || dateFilter) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100 hover:text-red-600 transition"
                title="Reset all search filters"
              >
                <FiRotateCcw size={16} />
              </button>
            )}
          </div>
        </form>

        {/* Active Filter Badges */}
        {(searchQuery || adminQuery || dateQuery) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
            <span className="font-black text-slate-500">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 font-bold text-cyan-800">
                Title: {searchQuery}
                <button type="button" onClick={() => removeSingleFilter("search")} className="hover:text-cyan-950"><FiX size={13} /></button>
              </span>
            )}
            {adminQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 font-bold text-purple-800">
                Admin: {getSelectedAdminName(adminQuery)}
                <button type="button" onClick={() => removeSingleFilter("adminId")} className="hover:text-purple-950"><FiX size={13} /></button>
              </span>
            )}
            {dateQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
                Date: {dateQuery}
                <button type="button" onClick={() => removeSingleFilter("date")} className="hover:text-emerald-950"><FiX size={13} /></button>
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto text-xs font-black text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {!isReporter && <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[1.4rem] border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={`${card.bg} ${card.color} flex h-11 w-11 items-center justify-center rounded-2xl`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="text-2xl font-black text-slate-950">{Number(card.value || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>}

      {!isReporter && <div className="mb-5 rounded-[1.4rem] border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-black text-slate-600">Filter:</span>
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSortBy(item.key)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                sortBy === item.key
                  ? "border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50"
              }`}
              title={item.helper}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Active: {activeFilter.helper}. {sortBy !== "manual" ? "Zero-count news is hidden in this filter." : "Manual mode shows all news."}
        </p>
      </div>}

      {loading ? (
        <p className="py-10 text-center font-bold text-slate-500">Loading...</p>
      ) : news.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-10 text-center font-bold text-slate-500">
          No news found for this {sortBy === "manual" ? "list" : activeFilter.label.toLowerCase()} filter{searchQuery ? ` and search "${searchQuery}"` : ""}.
        </div>
      ) : (
        <div className="grid gap-5">
          {news.map((item, index) => (
            <article
              key={item._id}
              draggable={!isReporter && sortBy === "manual"}
              onDragStart={(e) => !isReporter && sortBy === "manual" && handleDragStart(e, item._id)}
              onDragOver={(e) => {
                if (!isReporter && sortBy === "manual") {
                  e.preventDefault();
                  if (draggedId && draggedId !== item._id && dragOverId !== item._id) {
                    setDragOverId(item._id);
                  }
                }
              }}
              onDragLeave={() => {
                if (dragOverId === item._id) {
                  setDragOverId(null);
                }
              }}
              onDragEnd={handleDragEnd}
              onDrop={() => !isReporter && sortBy === "manual" && handleDrop(item._id)}
              className={`rounded-[1.6rem] border bg-white/90 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:shadow-xl hover:shadow-cyan-100 ${
                !isReporter && sortBy === "manual" ? "cursor-grab active:cursor-grabbing hover:border-cyan-200" : ""
              } ${
                draggedId === item._id
                  ? "opacity-30 border-dashed border-cyan-400 scale-[0.98]"
                  : dragOverId === item._id
                    ? "border-cyan-500 bg-cyan-50/40 translate-y-1 shadow-md ring-2 ring-cyan-500/20"
                    : item.isPinned
                      ? "border-cyan-300"
                      : "border-white/80"
              }`}
            >
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_1fr_auto] xl:items-start">
                <div className="order-1 xl:order-none">
                  {getPrimaryMedia(item) ? (
                    <MediaPreview
                      media={getPrimaryMedia(item)}
                      mediaItems={item.media}
                      compact
                      showName
                      className={
                        getMediaType(getPrimaryMedia(item)) === "video"
                          ? "h-64 xl:h-56"
                          : "h-44 xl:h-40"
                      }
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-black text-slate-400 xl:h-40">
                      No media
                    </div>
                  )}
                  {item.media?.length > 1 && (
                    <p className="mt-2 text-center text-xs font-black text-cyan-600">
                      +{item.media.length - 1} more media
                    </p>
                  )}
                </div>

                <div className="order-2 flex min-w-0 flex-1 items-start gap-4 xl:order-none">
                  <div className="hidden flex-col items-center gap-2 pt-1 text-slate-400 md:flex">
                    <FiMove className={!isReporter && sortBy === "manual" ? "cursor-grab" : "opacity-40"} />
                    <span className="text-xs font-black">#{(page - 1) * limit + index + 1}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-black text-white">
                          <FiStar /> Pinned
                        </span>
                      )}
                      {((item.categories && item.categories.length > 0) ? item.categories : (item.category ? [item.category] : [])).map((cat, catIdx) => (
                        <span key={cat._id || `cat-${catIdx}`} className="rounded-full px-3 py-1.5 text-xs font-black shadow-sm" style={{ backgroundColor: cat.backgroundColor || "#06B6D4", color: cat.textColor || "#FFFFFF" }}>
                          {cat.name}
                        </span>
                      ))}
                      {(!item.categories || item.categories.length === 0) && !item.category && (
                        <span className="rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-black text-white">
                          News
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        <FiCalendar /> {formatNewsDateTime(item.publishedDate)}
                      </span>
                      {(item.reporter?.name || item.createdBy?.name) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                          <FiUser /> {item.reporter?.name || item.createdBy?.name}
                        </span>
                      )}
                      <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                        <FiMapPin /> {item.cities?.length ? item.cities.map((city) => city.name).join(", ") : "All cities"}
                      </span>
                      {item.isBreaking && <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">{item.breakingText || "Breaking News"}</span>}
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${item.isActive === false ? "bg-slate-200 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {item.isActive === false ? "Off / Hidden" : "On / Visible"}
                      </span>
                    </div>
                    {item.titleLink ? (
                      <a
                        href={item.titleLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="mb-2 inline-flex max-w-full items-start gap-1 line-clamp-2 font-black underline decoration-cyan-400 underline-offset-4 hover:text-cyan-600"
                        style={{ color: item.titleColor || "#0f172a", fontSize: `${item.titleFontSize || 20}px` }}
                        title={item.titleLink}
                      >
                        <span className="line-clamp-2">{item.title}</span>
                        <FiExternalLink className="mt-1 shrink-0 text-cyan-500" size={16} />
                      </a>
                    ) : (
                      <h3
                        className="mb-2 line-clamp-2 font-black"
                        style={{ color: item.titleColor || "#0f172a", fontSize: `${item.titleFontSize || 20}px` }}
                      >
                        {item.title}
                      </h3>
                    )}
                    <p
                      className="line-clamp-2 font-medium leading-6 text-slate-600"
                      style={{ fontSize: `${item.descriptionFontSize || 16}px` }}
                    >
                      {stripHtml(item.description)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                        <FiEye /> {Number(item.viewCount || 0).toLocaleString()} Views
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                        <FiBookmark /> {Number(item.saveCount || 0).toLocaleString()} Saves
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                        <FiHeart /> {Number(item.likeCount || 0).toLocaleString()} Likes
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-black text-purple-700">
                        <FiShare2 /> {Number(item.shareCount || 0).toLocaleString()} Shares
                      </span>
                    </div>
                    {item.hashtags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.hashtags.map((tag, i) => <span key={`${tag}-${i}`} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-600">#{tag}</span>)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-3 flex shrink-0 gap-2 self-end xl:order-none xl:self-start">
                  {!isReporter && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.isActive !== false}
                      aria-label={item.isActive === false ? "Turn news on" : "Turn news off"}
                      onClick={() => toggleActive(item)}
                      disabled={togglingActiveId === item._id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title={item.isActive === false ? "Turn news on" : "Turn news off"}
                    >
                      <span
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                          item.isActive === false ? "bg-slate-300" : "bg-emerald-500"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            item.isActive === false ? "translate-x-0.5" : "translate-x-[22px]"
                          }`}
                        />
                      </span>
                      <span className={`text-xs font-black ${item.isActive === false ? "text-slate-500" : "text-emerald-700"}`}>
                        {togglingActiveId === item._id ? "Saving..." : item.isActive === false ? "Off" : "On"}
                      </span>
                    </button>
                  )}
                  {!isReporter && (
                    <button type="button" onClick={() => togglePin(item._id)} className={`rounded-2xl p-3 ${item.isPinned ? "bg-cyan-100" : "bg-slate-100 hover:bg-slate-200"}`} title={item.isPinned ? "Unpin" : "Pin to top"}>
                      <FiStar className={item.isPinned ? "text-cyan-600" : "text-slate-700"} />
                    </button>
                  )}
                  <Link to={`/news/edit/${item._id}`} className="rounded-2xl bg-slate-100 p-3 hover:bg-slate-200"><FiEdit className="text-slate-700" /></Link>
                  {user?.role === "super-admin" && (
                    <button type="button" onClick={() => deleteNews(item._id)} className="rounded-2xl bg-red-50 p-3 hover:bg-red-100"><FiTrash2 className="text-red-600" /></button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && news.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
            <span>
              Showing <span className="font-black text-slate-900">{Math.min((page - 1) * limit + 1, totalNewsCount)}</span> to{" "}
              <span className="font-black text-slate-900">{Math.min(page * limit, totalNewsCount)}</span> of{" "}
              <span className="font-black text-cyan-600">{totalNewsCount.toLocaleString()}</span> stories
            </span>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="font-medium text-slate-500">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="First page"
            >
              <FiChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <FiChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs font-bold text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePageChange(p)}
                  className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2.5 text-xs font-black transition ${
                    page === p
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <FiChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Last page"
            >
              <FiChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default NewsList;
