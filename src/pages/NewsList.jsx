import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
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
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import MediaPreview from "../components/MediaPreview";

const FILTERS = [
  { key: "manual", label: "Manual / pinned", helper: "All news" },
  { key: "views", label: "Most viewed", helper: "Only news with views" },
  { key: "saves", label: "Most saved", helper: "Only news with saves" },
  { key: "shares", label: "Most shared", helper: "Only news with shares" },
];

const getPrimaryMedia = (item) => (Array.isArray(item?.media) && item.media.length > 0 ? item.media[0] : null);
const stripHtml = (html) => (html || "").replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();

const NewsList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";
  const isReporter = user?.role === "reporter";

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [analyticsTotals, setAnalyticsTotals] = useState({ totalViews: 0, totalSaves: 0, totalShares: 0, totalNews: 0 });
  const [sortBy, setSortBy] = useState("manual");

  const getApiSortKey = (value) => {
    if (value === "views") return "viewCount";
    if (value === "saves") return "saveCount";
    if (value === "shares") return "shareCount";
    return "manual";
  };

  const fetchNews = async (activeSort = sortBy, activeSearch = searchQuery) => {
    try {
      setLoading(true);
      const safeSort = isReporter ? "manual" : activeSort;
      const apiSortKey = getApiSortKey(safeSort);
      const commonParams = { ...(activeSearch ? { search: activeSearch } : {}), includeInactive: true };

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

      setNews(newsData);
      if (analyticsRes?.data?.data?.totals) {
        setAnalyticsTotals(analyticsRes.data.data.totals);
      } else {
        setAnalyticsTotals({
          totalNews: newsData.length,
          totalViews: newsData.reduce((sum, item) => sum + Number(item.viewCount || 0), 0),
          totalSaves: newsData.reduce((sum, item) => sum + Number(item.saveCount || 0), 0),
          totalShares: newsData.reduce((sum, item) => sum + Number(item.shareCount || 0), 0),
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
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
      fetchNews(sortBy, searchQuery);
    } catch (error) {
      toast.error("Failed to delete news");
    }
  };

  const togglePin = async (id) => {
    if (isReporter) return;
    try {
      await axiosInstance.patch(`/news/${id}/toggle-pin`);
      toast.success("News pin status updated");
      fetchNews(sortBy, searchQuery);
    } catch (error) {
      toast.error("Failed to update pin status");
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
      fetchNews(sortBy, searchQuery);
    } catch (error) {
      toast.error("Failed to save news order");
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
    fetchNews(sortBy, searchQuery);
  }, [sortBy, searchQuery]);

  const activeFilter = FILTERS.find((item) => item.key === sortBy) || FILTERS[0];

  const statCards = [
    { label: "Total views", value: analyticsTotals.totalViews, icon: FiEye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total saves", value: analyticsTotals.totalSaves, icon: FiBookmark, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total shares", value: analyticsTotals.totalShares, icon: FiShare2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total news", value: analyticsTotals.totalNews || news.length, icon: FiBarChart2, color: "text-cyan-600", bg: "bg-cyan-50" },
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

      {searchQuery && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-cyan-800">
          <p className="text-sm font-bold">Showing search results for: <span className="font-black">{searchQuery}</span></p>
          <button onClick={clearSearch} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-100">
            <FiX /> Clear search
          </button>
        </div>
      )}

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
                      compact
                      showName
                      className="h-44 xl:h-40"
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
                    <span className="text-xs font-black">#{index + 1}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-black text-white">
                          <FiStar /> Pinned
                        </span>
                      )}
                      <span className="rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: item.category?.backgroundColor || "#06B6D4", color: item.category?.textColor || "#FFFFFF" }}>
                        {item.category?.name || "News"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        <FiCalendar /> {new Date(item.publishedDate).toLocaleDateString()}
                      </span>
                      <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                        <FiMapPin /> {item.cities?.length ? item.cities.map((city) => city.name).join(", ") : "All cities"}
                      </span>
                      {item.isBreaking && <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">{item.breakingText || "Breaking News"}</span>}
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${item.isActive === false ? "bg-slate-200 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {item.isActive === false ? "Off / Hidden" : "On / Visible"}
                      </span>
                    </div>
                    <h3
                      className="mb-2 line-clamp-2 font-black"
                      style={{ color: item.titleColor || "#0f172a", fontSize: `${item.titleFontSize || 20}px` }}
                    >
                      {item.title}
                    </h3>
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
    </AdminLayout>
  );
};

export default NewsList;
