import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiImage, FiVideo } from "react-icons/fi";

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

const MediaPreview = ({
  media,
  src,
  type,
  name,
  className = "",
  compact = false,
  showName = false,
  imageFit = "contain",
}) => {
  const [objectUrl, setObjectUrl] = useState("");

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

  const resolved = useMemo(() => {
    const file = media instanceof File ? media : media?.file || media?.rawFile;
    const mediaObject = file || media || {};
    const mediaUrl = objectUrl || src || mediaObject.url || mediaObject.path || mediaObject.preview || "";
    return {
      url: getFullMediaUrl(mediaUrl),
      type: type || getMediaType(mediaObject),
      name: name || mediaObject.originalName || mediaObject.name || "Media file",
    };
  }, [media, name, objectUrl, src, type]);

  const fitClass = imageFit === "cover" ? "object-cover" : "object-contain";
  const baseBox = compact ? "h-32" : "h-56 sm:h-64";
  const boxClass = `${baseBox} w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/5 ${className}`;

  if (!resolved.url) {
    return (
      <div className={`${boxClass} flex items-center justify-center bg-slate-100 text-slate-400`}>
        <FiImage size={28} />
      </div>
    );
  }

  if (resolved.type === "image") {
    return (
      <div>
        <div className={boxClass}>
          <img
            src={resolved.url}
            alt={resolved.name}
            className={`h-full w-full ${fitClass}`}
            loading="lazy"
          />
        </div>
        {showName && <p className="mt-2 truncate text-xs font-bold text-slate-500">{resolved.name}</p>}
      </div>
    );
  }

  if (resolved.type === "video") {
    return (
      <div>
        <div className={boxClass}>
          <video src={resolved.url} controls preload="metadata" className="h-full w-full object-contain" />
        </div>
        {showName && <p className="mt-2 truncate text-xs font-bold text-slate-500">{resolved.name}</p>}
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
          <a href={resolved.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-black text-red-600 hover:underline">
            Open PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${boxClass} flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center`}>
      <FiFileText className="text-slate-500" size={26} />
      <a href={resolved.url} target="_blank" rel="noreferrer" className="max-w-full truncate text-sm font-black text-cyan-700 hover:underline">
        {resolved.name}
      </a>
    </div>
  );
};

export default MediaPreview;
