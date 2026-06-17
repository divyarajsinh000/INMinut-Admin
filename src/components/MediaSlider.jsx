import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiTrash2 } from "react-icons/fi";
import MediaPreview, { getMediaType } from "./MediaPreview";

const formatFileSize = (size) => {
  if (!size && size !== 0) return "";
  const mb = size / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
};

const MediaSlider = ({
  items = [],
  title = "Media Preview",
  emptyText = "No media selected",
  onRemove,
  removeLabel = "Remove",
  getKey,
  getBadge,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeItems = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items]);
  const total = safeItems.length;
  const activeItem = safeItems[Math.min(activeIndex, Math.max(total - 1, 0))];

  const goTo = (nextIndex) => {
    if (!total) return;
    setActiveIndex((nextIndex + total) % total);
  };

  const handleRemove = () => {
    if (!onRemove || !activeItem) return;
    onRemove(activeItem, activeIndex);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, total - 2)));
  };

  if (!total) {
    return (
      <div className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-400 ${className}`}>
        {emptyText}
      </div>
    );
  }

  const keyFor = (item, index) => getKey?.(item, index) || item?._id || item?.name || item?.url || index;
  const badge = getBadge?.(activeItem, activeIndex) || getMediaType(activeItem);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-800">{title}</p>
          <p className="text-xs font-bold text-slate-500">
            {activeIndex + 1} of {total} media file{total > 1 ? "s" : ""}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
          {badge || "media"}
        </span>
      </div>

      <div className="relative">
        <MediaPreview media={activeItem} compact={false} showName className="h-72" />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow hover:bg-white"
              aria-label="Previous media"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow hover:bg-white"
              aria-label="Next media"
            >
              <FiChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-700">
            {activeItem?.originalName || activeItem?.name || activeItem?.filename || "Media file"}
          </p>
          {!!activeItem?.size && (
            <p className="text-xs font-bold text-slate-500">{formatFileSize(activeItem.size)}</p>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-200"
          >
            <FiTrash2 size={16} />
            {removeLabel}
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {safeItems.map((item, index) => (
            <button
              key={keyFor(item, index)}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 shrink-0 rounded-full transition-all ${index === activeIndex ? "w-8 bg-red-500" : "w-2.5 bg-slate-300"}`}
              aria-label={`Open media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaSlider;
