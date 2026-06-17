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
  FiZap,
} from "react-icons/fi";

const number = (value) => Number(value || 0).toLocaleString("en-IN");

const compactNumber = (value) => {
  const num = Number(value || 0);
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
};

const shortDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date || "-";
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const EmptyState = ({ text = "No data yet" }) => (
  <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 p-5 text-center text-sm font-bold text-slate-500">
    {text}
  </div>
);

const tabs = [
  { key: "today", label: "Today's Analytics", icon: FiActivity },
  { key: "category", label: "Category Wise", icon: FiTag },
  { key: "city", label: "City Wise", icon: FiMapPin },
  { key: "overall", label: "Overall Analytics", icon: FiBarChart2 },
];

const MetricCard = ({ label, value, icon: Icon, helper, tone = "cyan" }) => {
  const tones = {
    cyan: "from-red-500 to-red-600 shadow-red-500/20",
    blue: "from-red-500 to-rose-600 shadow-red-500/20",
    green: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    purple: "from-purple-500 to-fuchsia-600 shadow-purple-500/20",
    orange: "from-orange-500 to-red-600 shadow-orange-500/20",
    slate: "from-slate-700 to-slate-950 shadow-slate-500/20",
    red: "from-red-500 to-pink-600 shadow-red-500/20",
    yellow: "from-yellow-500 to-orange-600 shadow-yellow-500/20",
  };

  return (
    <div className="min-w-0 rounded-[1.3rem] border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500 break-words">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-950 break-words">{number(value)}</p>
          {helper && <p className="mt-1 text-xs font-bold text-slate-400 break-words">{helper}</p>}
        </div>
        <div className={`h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br ${tones[tone] || tones.cyan} text-white shadow-lg flex items-center justify-center`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <section className={`min-w-0 overflow-hidden rounded-[1.5rem] border border-red-100 bg-white p-4 sm:p-5 shadow-sm ${className}`}>
    <div className="mb-5 min-w-0">
      <h3 className="break-words text-base sm:text-lg font-black text-slate-950">{title}</h3>
      {subtitle && <p className="mt-1 break-words text-xs sm:text-sm font-bold text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const RankingList = ({ title, icon: Icon, items = [], valueKey = "views", valueLabel = "Views", getName, getMeta }) => (
  <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-red-100 bg-white p-4 sm:p-5 shadow-sm">
    <div className="mb-4 flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <Icon />
      </div>
      <h3 className="min-w-0 break-words font-black text-slate-950">{title}</h3>
    </div>

    {!items?.length ? (
      <EmptyState />
    ) : (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item._id || item.hashtag || item.title || item.name || index} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 hover:bg-red-50/40">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">#{item.rank || index + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">{getName ? getName(item) : item.name || "Unknown"}</p>
                {getMeta && <p className="mt-0.5 truncate text-xs font-bold text-slate-500">{getMeta(item)}</p>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-black text-slate-950">{number(item[valueKey])}</p>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{valueLabel}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const BarChart = ({ items = [], labelKey = "name", valueKey = "views", suffix = "" }) => {
  const visibleItems = (items || []).slice(0, 10);
  const max = Math.max(...visibleItems.map((item) => Number(item[valueKey] || 0)), 1);

  if (!visibleItems.length) return <EmptyState />;

  return (
    <div className="min-w-0 space-y-3">
      {visibleItems.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        const width = Math.max((value / max) * 100, value > 0 ? 7 : 0);
        return (
          <div key={item._id || item[labelKey] || item.name || index} className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-black text-slate-700">{item[labelKey] || item.name || "Unknown"}</p>
              <p className="shrink-0 text-sm font-black text-slate-950">{compactNumber(value)}{suffix}</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const GroupedTrendChart = ({ items = [] }) => {
  const visibleItems = (items || []).slice(-14);
  const max = Math.max(...visibleItems.flatMap((item) => [item.views || 0, item.saves || 0, item.shares || 0]), 1);

  if (!visibleItems.length) return <EmptyState />;

  return (
    <div className="min-w-0">
      <div className="h-60 min-w-0 overflow-x-auto overflow-y-hidden border-b border-slate-100 pb-2">
        <div className="flex h-full min-w-[520px] items-end gap-2">
          {visibleItems.map((item) => {
            const viewsHeight = Math.max((Number(item.views || 0) / max) * 100, item.views ? 7 : 2);
            const savesHeight = Math.max((Number(item.saves || 0) / max) * 100, item.saves ? 7 : 2);
            const sharesHeight = Math.max((Number(item.shares || 0) / max) * 100, item.shares ? 7 : 2);
            return (
              <div key={item.date} className="group relative flex h-full flex-1 items-end justify-center gap-1">
                <div className="w-2 rounded-t-lg bg-red-500" style={{ height: `${viewsHeight}%` }} />
                <div className="w-2 rounded-t-lg bg-emerald-500" style={{ height: `${savesHeight}%` }} />
                <div className="w-2 rounded-t-lg bg-purple-500" style={{ height: `${sharesHeight}%` }} />
                <div className="absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:block">
                  {shortDate(item.date)} • {number(item.views)} views • {number(item.saves)} saves • {number(item.shares)} shares
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-black text-slate-500">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-red-500" /> Views</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-500" /> Saves</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-purple-500" /> Shares</span>
      </div>
    </div>
  );
};

const SingleTrendChart = ({ items = [], valueKey = "news", label = "News" }) => {
  const visibleItems = (items || []).slice(-14);
  const max = Math.max(...visibleItems.map((item) => Number(item[valueKey] || 0)), 1);

  if (!visibleItems.length) return <EmptyState />;

  return (
    <div className="min-w-0">
      <div className="h-60 overflow-x-auto overflow-y-hidden border-b border-slate-100 pb-2">
        <div className="flex h-full min-w-[520px] items-end gap-2">
          {visibleItems.map((item) => {
            const value = Number(item[valueKey] || 0);
            const height = Math.max((value / max) * 100, value ? 8 : 2);
            return (
              <div key={item.date} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full max-w-7 rounded-t-xl bg-gradient-to-t from-red-500 to-red-500" style={{ height: `${height}%` }} />
                <span className="hidden text-[10px] font-bold text-slate-400 sm:block">{shortDate(item.date)}</span>
                <div className="absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:block">
                  {shortDate(item.date)} • {number(value)} {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SplitChart = ({ items = [], labelKey = "platform", valueKey = "users" }) => {
  const visibleItems = (items || []).filter((item) => Number(item[valueKey] || 0) > 0).slice(0, 8);
  const total = visibleItems.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0);

  if (!visibleItems.length || total === 0) return <EmptyState />;

  return (
    <div className="min-w-0 grid grid-cols-1 gap-5 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
      <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-red-500 to-slate-900 shadow-inner">
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
          <p className="text-xs font-black uppercase text-slate-400">Total</p>
          <p className="text-xl font-black text-slate-950">{number(total)}</p>
        </div>
      </div>
      <div className="min-w-0 space-y-3">
        {visibleItems.map((item, index) => {
          const value = Number(item[valueKey] || 0);
          const percent = total ? Math.round((value / total) * 100) : 0;
          return (
            <div key={item[labelKey] || index} className="min-w-0">
              <div className="mb-1 flex min-w-0 justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-black capitalize text-slate-700">{item[labelKey] || "Unknown"}</span>
                <span className="shrink-0 text-sm font-black text-slate-950">{number(value)} • {percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Header = ({ activeTab, setActiveTab, onRefresh }) => (
  <div className="mb-6 min-w-0">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-red-600">Admin Analytics</p>
        <h2 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">Clean chart and number analytics</h2>
        <p className="mt-1 max-w-3xl break-words text-sm font-medium leading-6 text-slate-500">
          Data is separated into four simple sections, so the screen stays responsive and easy to read.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black text-white shadow-lg shadow-red-500/25 hover:bg-red-600 sm:w-auto"
      >
        <FiRefreshCw /> Refresh
      </button>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`min-w-0 rounded-2xl border px-3 py-3 text-left transition ${
              active
                ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "border-red-100 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="shrink-0" />
              <span className="min-w-0 truncate text-xs font-black sm:text-sm">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

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
  const charts = data?.charts || {};

  const todayCards = useMemo(() => {
    const topTodayCategory = data?.todayTopCategories?.[0];
    const topTodayCity = data?.todayTopNewsCities?.[0];

    return [
      { label: "Today's News", value: totals.todayNews, icon: FiFileText, tone: "cyan" },
      { label: "Today's Views", value: totals.todayViews, icon: FiEye, tone: "blue" },
      { label: "Today's Saves", value: totals.todaySaves, icon: FiBookmark, tone: "green" },
      { label: "Today's Shares", value: totals.todayShares, icon: FiShare2, tone: "purple" },
      { label: "Today Active Users", value: totals.todayActiveUsers, icon: FiActivity, tone: "orange" },
      { label: "New Guests Today", value: totals.todayGuestUsers, icon: FiUsers, tone: "slate" },
      {
        label: "Today Top Category News",
        value: topTodayCategory?.newsCount,
        helper: topTodayCategory?.name || "No category news today",
        icon: FiTag,
        tone: "yellow",
      },
      {
        label: "Today Top City News",
        value: topTodayCity?.newsCount,
        helper: topTodayCity?.name || "No city news today",
        icon: FiMapPin,
        tone: "red",
      },
    ];
  }, [data, totals]);

  const categoryCards = useMemo(() => {
    const topCategory = data?.topCategories?.[0];
    return [
      { label: "Total Categories", value: data?.topCategories?.length, helper: "Available in analytics", icon: FiTag, tone: "cyan" },
      { label: "Top Category Views", value: topCategory?.views, helper: topCategory?.name || "No category yet", icon: FiEye, tone: "blue" },
      { label: "Top Category Saves", value: topCategory?.saves, helper: topCategory?.name || "No saves yet", icon: FiBookmark, tone: "green" },
      { label: "Top Category Shares", value: topCategory?.shares, helper: topCategory?.name || "No shares yet", icon: FiShare2, tone: "purple" },
    ];
  }, [data]);

  const cityCards = useMemo(() => {
    const topNewsCity = data?.topNewsCities?.[0];
    const topUserCity = data?.topUserCities?.[0];
    return [
      { label: "News Cities", value: data?.topNewsCities?.length, helper: "Cities with news activity", icon: FiMapPin, tone: "cyan" },
      { label: "Top City Views", value: topNewsCity?.views, helper: topNewsCity?.name || "No city yet", icon: FiEye, tone: "blue" },
      { label: "Top User City", value: topUserCity?.users, helper: topUserCity?.name || "No user city yet", icon: FiUsers, tone: "green" },
      { label: "All City News", value: totals.newsWithoutCity, helper: "News visible to all cities", icon: FiMapPin, tone: "slate" },
    ];
  }, [data, totals]);

  const overallCards = useMemo(
    () => [
      { label: "Total News", value: totals.totalNews, icon: FiFileText, tone: "cyan" },
      { label: "Total Views", value: totals.totalViews, icon: FiEye, tone: "blue" },
      { label: "Total Saves", value: totals.totalSaves, icon: FiBookmark, tone: "green" },
      { label: "Total Shares", value: totals.totalShares, icon: FiShare2, tone: "purple" },
      { label: "Guest Users", value: totals.totalGuestUsers, icon: FiUsers, tone: "slate" },
      { label: "Notifications On", value: totals.notificationsEnabledUsers, icon: FiSmartphone, tone: "cyan" },
      { label: "Pinned News", value: totals.pinnedNews, icon: FiTrendingUp, tone: "yellow" },
      { label: "Breaking News", value: totals.breakingNews, icon: FiZap, tone: "red" },
    ],
    [totals]
  );

  return (
    <AdminLayout title="Analytics">
      <div className="w-full max-w-full overflow-x-hidden pb-6">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onRefresh={fetchAnalytics} />

        {loading ? (
          <div className="rounded-[1.5rem] border border-red-100 bg-white p-10 text-center font-bold text-slate-500 shadow-sm">
            Loading analytics...
          </div>
        ) : (
          <div className="min-w-0 space-y-5">
            {activeTab === "today" && (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {todayCards.map((card) => <MetricCard key={card.label} {...card} />)}
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <ChartCard title="Today top category news" subtitle="Categories with the highest number of news added today">
                    <BarChart items={charts.todayCategoryPerformance || data?.todayTopCategories || []} labelKey="name" valueKey="newsCount" />
                  </ChartCard>
                  <ChartCard title="Today top city news" subtitle="Cities with the highest number of news added today">
                    <BarChart items={charts.todayCityPerformance || data?.todayTopNewsCities || []} labelKey="name" valueKey="newsCount" />
                  </ChartCard>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <ChartCard title="Today and recent activity" subtitle="Views, saves and shares trend from recent days">
                    <GroupedTrendChart items={charts.actionTrend} />
                  </ChartCard>
                  <ChartCard title="News publish trend" subtitle="Latest 14 days of news publishing">
                    <SingleTrendChart items={charts.newsPublishTrend} valueKey="news" label="news" />
                  </ChartCard>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <RankingList title="Today Top Category News" icon={FiTag} items={data?.todayTopCategories} valueKey="newsCount" valueLabel="News" getName={(item) => item.name} getMeta={(item) => `${number(item.views)} views • ${number(item.saves)} saves • ${number(item.shares)} shares`} />
                  <RankingList title="Today Top City News" icon={FiMapPin} items={data?.todayTopNewsCities} valueKey="newsCount" valueLabel="News" getName={(item) => item.name} getMeta={(item) => `${number(item.views)} views • ${number(item.saves)} saves • ${number(item.shares)} shares`} />
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                  <RankingList title="Most Viewed Today-Relevant News" icon={FiEye} items={data?.topNewsByViews} valueKey="viewCount" valueLabel="Views" getName={(item) => item.title} getMeta={(item) => item.category?.name || "No category"} />
                  <RankingList title="Most Saved News" icon={FiBookmark} items={data?.topNewsBySaves} valueKey="saveCount" valueLabel="Saves" getName={(item) => item.title} getMeta={(item) => item.category?.name || "No category"} />
                  <RankingList title="Most Shared News" icon={FiShare2} items={data?.topNewsByShares} valueKey="shareCount" valueLabel="Shares" getName={(item) => item.title} getMeta={(item) => item.category?.name || "No category"} />
                </div>
              </>
            )}

            {activeTab === "category" && (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {categoryCards.map((card) => <MetricCard key={card.label} {...card} />)}
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                  <ChartCard title="Category-wise views" subtitle="Top categories by total views">
                    <BarChart items={charts.categoryPerformance || data?.topCategories || []} labelKey="name" valueKey="views" />
                  </ChartCard>
                  <ChartCard title="Category-wise saves" subtitle="Categories users are saving most">
                    <BarChart items={charts.categoryPerformance || data?.topCategories || []} labelKey="name" valueKey="saves" />
                  </ChartCard>
                  <ChartCard title="Category-wise shares" subtitle="Categories users are sharing most">
                    <BarChart items={charts.categoryPerformance || data?.topCategories || []} labelKey="name" valueKey="shares" />
                  </ChartCard>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <RankingList title="Most Viewed Categories" icon={FiTag} items={data?.topCategories} valueKey="views" valueLabel="Views" getName={(item) => item.name} getMeta={(item) => `${number(item.newsCount)} news • ${number(item.saves)} saves • ${number(item.shares)} shares`} />
                  <RankingList title="Most Used / Viewed Hashtags" icon={FiHash} items={data?.topHashtags} valueKey="views" valueLabel="Views" getName={(item) => `#${String(item.hashtag || "").replace(/^#/, "")}`} getMeta={(item) => `${number(item.newsCount)} news • ${number(item.shares)} shares`} />
                </div>
              </>
            )}

            {activeTab === "city" && (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {cityCards.map((card) => <MetricCard key={card.label} {...card} />)}
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                  <ChartCard title="City-wise views" subtitle="Most viewed cities from news activity">
                    <BarChart items={charts.cityPerformance || data?.topNewsCities || []} labelKey="name" valueKey="views" />
                  </ChartCard>
                  <ChartCard title="City-wise saves" subtitle="Saved news by city">
                    <BarChart items={charts.cityPerformance || data?.topNewsCities || []} labelKey="name" valueKey="saves" />
                  </ChartCard>
                  <ChartCard title="City-wise shares" subtitle="Shared news by city">
                    <BarChart items={charts.cityPerformance || data?.topNewsCities || []} labelKey="name" valueKey="shares" />
                  </ChartCard>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                  <RankingList title="City News Viewed Most" icon={FiMapPin} items={data?.topNewsCities} valueKey="views" valueLabel="Views" getName={(item) => item.name} getMeta={(item) => `${number(item.newsCount)} news • ${number(item.saves)} saves • ${number(item.shares)} shares`} />
                  <RankingList title="Most User Cities" icon={FiUsers} items={data?.topUserCities} valueKey="users" valueLabel="Users" getName={(item) => item.name} getMeta={() => "Based on app city preferences"} />
                  <RankingList title="Views By Guest City" icon={FiActivity} items={data?.viewsByGuestCity} valueKey="views" valueLabel="Views" getName={(item) => item.name} getMeta={(item) => `${number(item.uniqueUsers)} unique users`} />
                </div>
              </>
            )}

            {activeTab === "overall" && (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {overallCards.map((card) => <MetricCard key={card.label} {...card} />)}
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                  <ChartCard title="Platform split" subtitle="Registered guest users by platform">
                    <SplitChart items={charts.platformBreakdown || []} labelKey="platform" valueKey="users" />
                  </ChartCard>
                  <ChartCard title="Media type usage" subtitle="Images, videos and PDF uploads">
                    <SplitChart items={charts.mediaTypeBreakdown || []} labelKey="type" valueKey="count" />
                  </ChartCard>
                  <ChartCard title="Reporter performance" subtitle="Views generated by reporters">
                    <BarChart items={data?.reporterPerformance || []} labelKey="name" valueKey="views" />
                  </ChartCard>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <RankingList title="Reporter Performance" icon={FiTrendingUp} items={data?.reporterPerformance} valueKey="views" valueLabel="Views" getName={(item) => item.name || "Reporter"} getMeta={(item) => `${number(item.newsCount)} news • ${number(item.saves)} saves • ${number(item.shares)} shares`} />
                  <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-sm relative">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
                    <div className="relative z-10 min-w-0">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-red-300">
                        <FiTrendingUp />
                      </div>
                      <h3 className="break-words text-xl font-black">How to use this data?</h3>
                      <p className="mt-2 break-words text-sm font-medium leading-7 text-slate-300">
                        Use category and city tabs to decide what to publish next. Use today's analytics for daily performance, and overall analytics for platform, media and reporter decisions.
                      </p>
                      <Link to="/news" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black text-white hover:bg-red-600 sm:w-auto">
                        <FiBarChart2 /> Open News Ranking
                      </Link>
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;
