import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import {
  FiActivity,
  FiBarChart2,
  FiBookmark,
  FiEye,
  FiFileText,
  FiHash,
  FiMapPin,
  FiRefreshCw,
  FiShare2,
  FiSmartphone,
  FiTag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const number = (value) => Number(value || 0).toLocaleString();

const EmptyState = ({ text = "No data yet" }) => (
  <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center text-sm font-bold text-slate-500">
    {text}
  </div>
);

const RankingList = ({ title, icon: Icon, items, valueKey = "views", valueLabel = "Views", getName, getMeta }) => (
  <section className="bg-white rounded-[1.5rem] border border-cyan-100 shadow-sm p-5">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <Icon />
        </div>
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
    </div>

    {!items?.length ? (
      <EmptyState />
    ) : (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item._id || item.hashtag || item.title || index} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-cyan-50/40">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-8 w-8 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center justify-center">#{item.rank || index + 1}</span>
              <div className="min-w-0">
                <p className="font-black text-slate-900 truncate">{getName ? getName(item) : item.name}</p>
                {getMeta && <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{getMeta(item)}</p>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-slate-950">{number(item[valueKey])}</p>
              <p className="text-[11px] uppercase tracking-wide font-black text-slate-400">{valueLabel}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/news/analytics/dashboard", { params: { limit: 10 } });
      setData(response.data.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totals = data?.totals || {};

  const statCards = useMemo(
    () => [
      { label: "Total Views", value: totals.totalViews, icon: FiEye, color: "from-blue-500 to-indigo-600" },
      { label: "Total Saves", value: totals.totalSaves, icon: FiBookmark, color: "from-emerald-500 to-teal-600" },
      { label: "Total Shares", value: totals.totalShares, icon: FiShare2, color: "from-purple-500 to-fuchsia-600" },
      { label: "Total News", value: totals.totalNews, icon: FiFileText, color: "from-cyan-500 to-red-500" },
      { label: "Guest Users", value: totals.totalGuestUsers, icon: FiUsers, color: "from-slate-700 to-slate-950" },
      { label: "Notifications On", value: totals.notificationsEnabledUsers, icon: FiSmartphone, color: "from-cyan-500 to-blue-600" },
    ],
    [totals]
  );

  return (
    <AdminLayout title="Analytics">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-cyan-600 font-black uppercase tracking-widest text-xs">Admin Analytics</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950 mt-1">News performance dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">
            See most viewed news, most shared news, top cities, top user cities, categories and hashtags.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center justify-center gap-2 bg-cyan-500 text-white px-5 py-3 rounded-2xl font-black hover:bg-cyan-600 shadow-lg shadow-cyan-500/25"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10 font-bold">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-[1.4rem] border border-cyan-100 p-4 shadow-sm">
                  <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-3`}>
                    <Icon />
                  </div>
                  <p className="text-xs text-slate-500 font-black uppercase tracking-wide">{card.label}</p>
                  <p className="text-2xl font-black text-slate-950 mt-1">{number(card.value)}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            <RankingList
              title="Most Viewed News"
              icon={FiEye}
              items={data?.topNewsByViews}
              valueKey="viewCount"
              valueLabel="Views"
              getName={(item) => item.title}
              getMeta={(item) => item.category?.name || "No category"}
            />
            <RankingList
              title="Most Saved News"
              icon={FiBookmark}
              items={data?.topNewsBySaves}
              valueKey="saveCount"
              valueLabel="Saves"
              getName={(item) => item.title}
              getMeta={(item) => item.category?.name || "No category"}
            />
            <RankingList
              title="Most Shared News"
              icon={FiShare2}
              items={data?.topNewsByShares}
              valueKey="shareCount"
              valueLabel="Shares"
              getName={(item) => item.title}
              getMeta={(item) => item.category?.name || "No category"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <RankingList
              title="City News Viewed Most"
              icon={FiMapPin}
              items={data?.topNewsCities}
              valueKey="views"
              valueLabel="Views"
              getName={(item) => item.name}
              getMeta={(item) => `${number(item.newsCount)} news • ${number(item.shares)} shares`}
            />
            <RankingList
              title="Most User Cities"
              icon={FiUsers}
              items={data?.topUserCities}
              valueKey="users"
              valueLabel="Users"
              getName={(item) => item.name}
              getMeta={() => "Based on app city preferences"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <RankingList
              title="Most Viewed Categories"
              icon={FiTag}
              items={data?.topCategories}
              valueKey="views"
              valueLabel="Views"
              getName={(item) => item.name}
              getMeta={(item) => `${number(item.newsCount)} news • ${number(item.saves)} saves • ${number(item.shares)} shares`}
            />
            <RankingList
              title="Most Used / Viewed Hashtags"
              icon={FiHash}
              items={data?.topHashtags}
              valueKey="views"
              valueLabel="Views"
              getName={(item) => `#${String(item.hashtag || "").replace(/^#/, "")}`}
              getMeta={(item) => `${number(item.newsCount)} news • ${number(item.shares)} shares`}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RankingList
              title="Views By Guest City"
              icon={FiActivity}
              items={data?.viewsByGuestCity}
              valueKey="views"
              valueLabel="Views"
              getName={(item) => item.name}
              getMeta={(item) => `${number(item.uniqueUsers)} unique users`}
            />

            <section className="bg-slate-950 rounded-[1.5rem] border border-slate-800 shadow-sm p-5 text-white overflow-hidden relative">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="relative z-10">
                <div className="h-11 w-11 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center mb-4">
                  <FiTrendingUp />
                </div>
                <h3 className="font-black text-xl">What to do with this data?</h3>
                <p className="text-slate-300 font-medium mt-2 leading-7">
                  Use city and category analytics to decide which local news to publish more. Use top hashtags to create repeatable topics. Use most shared/saved news to understand which stories users found valuable.
                </p>
                <Link to="/news" className="inline-flex items-center gap-2 mt-5 bg-cyan-500 text-white px-5 py-3 rounded-2xl font-black hover:bg-cyan-600">
                  <FiBarChart2 /> Open News Ranking
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Analytics;
