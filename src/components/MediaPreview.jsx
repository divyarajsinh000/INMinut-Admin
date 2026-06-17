import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiFileText,
  FiImage,
  FiMaximize2,
  FiMinus,
  FiPlus,
  FiRefreshCcw,
  FiX,
} from "react-icons/fi";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export const getFullMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const getExtension = (name = "") => name.split(".").pop()?.toLowerCase() || "";

export const getMediaType = (media = {}) => {
  const explicitType = media.type || media.mediaType;
  if (["image", "video", "pdf"].includes(explicitType)) return explicitType;

  const mimeType = media.mimetype || media.mimeType || media.file?.type || media.rawFile?.type || "";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";

  const name = media.originalName || media.name || media.filename || media.url || "";
  const ext = getExtension(name);
  if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg", "mov", "m4v"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";

  return "file";
};

const clampZoom = (value) => Math.min(4, Math.max(1, Number(value.toFixed(2))));

const MediaPreview = ({
  media,
  src,
  type,
  name,
  className = "",
  compact = false,
  showName = false,
  imageFit = "contain",
  mediaItems = [],
  initialIndex = 0,
}) => {
  const [objectUrl, setObjectUrl] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewerIndex, setViewerIndex] = useState(initialIndex);

  useEffect(() => {
    const file = media instanceof File ? media : media?.file || media?.rawFile;
    if (!file) {
      setObjectUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [media]);

  const resolveMediaItem = (item = {}, fallback = {}) => {
    const file = item instanceof File ? item : item?.file || item?.rawFile;
    const mediaObject = file || item || {};
    const mediaUrl =
      fallback.objectUrl ||
      fallback.src ||
      mediaObject.url ||
      mediaObject.path ||
      mediaObject.preview ||
      "";

    return {
      url: getFullMediaUrl(mediaUrl),
      type: fallback.type || getMediaType(mediaObject),
      name:
        fallback.name ||
        mediaObject.originalName ||
        mediaObject.name ||
        mediaObject.filename ||
        "Media file",
    };
  };

  const galleryItems = useMemo(() => {
    const list = Array.isArray(mediaItems) ? mediaItems.filter(Boolean) : [];
    return list.length ? list : [media].filter(Boolean);
  }, [media, mediaItems]);

  const galleryResolved = useMemo(() => {
    if (!galleryItems.length) {
      return [resolveMediaItem(media, { objectUrl, src, type, name })];
    }

    return galleryItems.map((item, index) =>
      resolveMediaItem(item, index === 0 ? { objectUrl, src, type, name } : {})
    );
  }, [galleryItems, media, name, objectUrl, src, type]);

  const resolved = galleryResolved[0] || resolveMediaItem(media, { objectUrl, src, type, name });
  const activeViewerMedia = galleryResolved[viewerIndex] || resolved;

  const fitClass = imageFit === "cover" ? "object-cover" : "object-contain";
  const baseBox = compact ? "h-32" : "h-56 sm:h-64";
  const boxClass = `${baseBox} w-full overflow-hidden rounded-2xl border border-red-100 bg-white shadow-inner ring-1 ring-slate-950/5 ${className}`;
  const canOpenFullscreen = resolved.type === "image" || resolved.type === "video";

  const goToViewerItem = (nextIndex) => {
    const total = galleryResolved.length;
    if (!total) return;
    setViewerIndex((nextIndex + total) % total);
    setZoom(1);
  };

  const openViewer = () => {
    if (!canOpenFullscreen) return;
    setViewerIndex(Math.min(Math.max(initialIndex, 0), Math.max(galleryResolved.length - 1, 0)));
    setZoom(1);
    setIsViewerOpen(true);
  };

  useEffect(() => {
    if (!isViewerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsViewerOpen(false);
      if ((event.key === "+" || event.key === "=") && activeViewerMedia.type === "image") {
        event.preventDefault();
        setZoom((current) => clampZoom(current + 0.25));
      }
      if (event.key === "-" && activeViewerMedia.type === "image") {
        event.preventDefault();
        setZoom((current) => clampZoom(current - 0.25));
      }
      if (event.key === "0" && activeViewerMedia.type === "image") {
        event.preventDefault();
        setZoom(1);
      }
      if (event.key === "ArrowLeft" && galleryResolved.length > 1) {
        event.preventDefault();
        goToViewerItem(viewerIndex - 1);
      }
      if (event.key === "ArrowRight" && galleryResolved.length > 1) {
        event.preventDefault();
        goToViewerItem(viewerIndex + 1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, activeViewerMedia.type, galleryResolved.length, viewerIndex]);

  useEffect(() => {
    if (isViewerOpen) setZoom(1);
  }, [isViewerOpen, viewerIndex]);

  const FullscreenViewer = () => {
    if (!isViewerOpen || !canOpenFullscreen) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[999999] flex h-screen w-screen flex-col bg-black/95"
        role="dialog"
        aria-modal="true"
        onClick={() => setIsViewerOpen(false)}
      >
        <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{activeViewerMedia.name}</p>
            <p className="text-xs font-semibold text-white/60">
              {galleryResolved.length > 1 ? "Use ← / → to slide. " : ""}
              {activeViewerMedia.type === "image" ? "Use + / - to zoom. Drag scrollbars after zoom." : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activeViewerMedia.type === "image" && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom((current) => clampZoom(current - 0.25));
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Zoom out"
                >
                  <FiMinus />
                </button>
                <span className="min-w-[58px] rounded-full bg-white px-3 py-2 text-center text-xs font-black text-slate-950">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom((current) => clampZoom(current + 0.25));
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Zoom in"
                >
                  <FiPlus />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom(1);
                  }}
                  className="hidden h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-black text-white hover:bg-white/20 sm:inline-flex"
                  title="Reset zoom"
                >
                  <FiRefreshCcw /> Reset
                </button>
              </>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsViewerOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg hover:bg-red-50"
              aria-label="Close preview"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {galleryResolved.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToViewerItem(viewerIndex - 1);
              }}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-red-600"
              aria-label="Previous media"
            >
              <FiChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToViewerItem(viewerIndex + 1);
              }}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-red-600"
              aria-label="Next media"
            >
              <FiChevronRight size={26} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur">
              {viewerIndex + 1} / {galleryResolved.length}
            </div>
          </>
        )}

        <div
          className="flex-1 overflow-auto p-4"
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => {
            if (activeViewerMedia.type !== "image" || !event.ctrlKey) return;
            event.preventDefault();
            setZoom((current) => clampZoom(current + (event.deltaY < 0 ? 0.2 : -0.2)));
          }}
        >
          {activeViewerMedia.type === "image" ? (
            <div className="flex min-h-full items-center justify-center">
              <img
                src={activeViewerMedia.url}
                alt={activeViewerMedia.name}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={() => setZoom((current) => (current === 1 ? 2 : 1))}
                className="select-none rounded-2xl bg-white object-contain shadow-2xl transition-all duration-150"
                style={{
                  width: zoom === 1 ? "auto" : `${zoom * 100}%`,
                  maxWidth: zoom === 1 ? "100%" : "none",
                  maxHeight: zoom === 1 ? "calc(100vh - 112px)" : "none",
                }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center">
              <video
                src={activeViewerMedia.url}
                controls
                autoPlay
                className="max-h-[calc(100vh-112px)] max-w-full rounded-2xl bg-black object-contain shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  if (!resolved.url) {
    return (
      <div className={`${boxClass} flex items-center justify-center bg-slate-100 text-slate-400`}>
        <FiImage size={28} />
      </div>
    );
  }

  if (resolved.type === "image") {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={openViewer}
          className={`${boxClass} group relative block cursor-zoom-in p-0 text-left`}
          title="Click to open image fullscreen"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]" />
          <img
            src={resolved.url}
            alt={resolved.name}
            className={`relative h-full w-full ${fitClass}`}
            loading="lazy"
          />
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-lg">
            Image
          </span>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur transition group-hover:bg-red-600">
            <FiMaximize2 /> {galleryResolved.length > 1 ? "View all" : "View / zoom"}
          </span>
        </button>
        {showName && <p className="mt-2 truncate text-xs font-bold text-slate-500">{resolved.name}</p>}
        <FullscreenViewer />
      </div>
    );
  }

  if (resolved.type === "video") {
    return (
      <div className="w-full">
        <div className={`${boxClass} group relative`}>
          <video src={resolved.url} controls preload="metadata" className="h-full w-full bg-black object-contain" />
          <button
            type="button"
            onClick={openViewer}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur hover:bg-red-600"
            title="Open video fullscreen"
          >
            <FiMaximize2 /> {galleryResolved.length > 1 ? "View all" : "Fullscreen"}
          </button>
        </div>
        {showName && <p className="mt-2 truncate text-xs font-bold text-slate-500">{resolved.name}</p>}
        <FullscreenViewer />
      </div>
    );
  }

  if (resolved.type === "pdf") {
    return (
      <div className={`${boxClass} flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-50 to-white p-4 text-center`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <FiFileText size={24} />
        </div>
        <div className="min-w-0 max-w-full">
          <p className="truncate text-sm font-black text-slate-800">{resolved.name}</p>
          <a href={resolved.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-black text-red-600 hover:underline">
            Open PDF <FiExternalLink />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${boxClass} flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center`}>
      <FiFileText className="text-slate-500" size={26} />
      <a href={resolved.url} target="_blank" rel="noreferrer" className="max-w-full truncate text-sm font-black text-red-600 hover:underline">
        {resolved.name}
      </a>
    </div>
  );
};

export default MediaPreview;
