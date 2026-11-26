import { useEffect, useMemo, useRef, useState } from "react";
import { getEmbedSizing, embedSizingCss, embedSizingScript } from "../utils/embedSizing";
function normalizeEmbedUrl(value) {
  value = value.trim();
  if (!/^(https?:\/\/|\/\/)/i.test(value) || /\s/.test(value)) return "";
  let url;
  try { url = new URL(value.startsWith("//") ? `https:${value}` : value); } catch { return ""; }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be"].includes(host)) {
    const id = host === "youtu.be" ? parts[0] : parts[0] === "watch" ? url.searchParams.get("v") : ["shorts", "embed", "live", "v"].includes(parts[0]) ? parts[1] : null;
    if (/^[A-Za-z0-9_-]{11}$/.test(id || "")) return `https://www.youtube.com/embed/${id}${parts[0] === "embed" ? url.search : ""}`;
  }
  if (["instagram.com", "www.instagram.com", "m.instagram.com"].includes(host) && ["p", "reel", "reels", "tv"].includes(parts[0]) && /^[A-Za-z0-9_-]+$/.test(parts[1] || "")) {
    return `https://www.instagram.com/${parts[0] === "reels" ? "reel" : parts[0]}/${parts[1]}/embed/`;
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
    const id = parts[0] === "video" ? parts[1] : parts[0];
    if (/^\d+$/.test(id || "")) return `https://player.vimeo.com/video/${id}${url.search}`;
  }
  if (host === "open.spotify.com") {
    const [kind, id] = parts[0] === "embed" ? parts.slice(1) : parts;
    if (["track", "episode", "album", "playlist", "show", "artist"].includes(kind) && /^[a-zA-Z0-9]+$/.test(id || "")) return `https://open.spotify.com/embed/${kind}/${id}`;
  }
  return url.href;
}

const escapeAttribute = value => value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const buildHtmlDocument = (code, sizing, key) => `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="referrer" content="strict-origin-when-cross-origin"/><style>blockquote,iframe,video,img,embed,object{max-width:100% !important;box-sizing:border-box !important;border-radius:8px;} ${embedSizingCss(sizing)}</style></head><body><div id="embed-fit"><div id="embed-content">${code}</div></div>${embedSizingScript(sizing,key)}${/instagram-media/i.test(code) && !/instagram\.com\/embed\.js/i.test(code) ? '<script async src="https://www.instagram.com/embed.js"></script>' : ""}</body></html>`;

export default function EmbedAppPreview({ form }) {
  const code = String(form.embedCode || "").trim();
  const sizing = useMemo(() => getEmbedSizing(code, form.height, form.width, form.autoSize === true, { widthMode: form.widthMode, paddingHorizontal: form.paddingHorizontal, paddingVertical: form.paddingVertical, alignment: form.alignment }), [code, form.height, form.width, form.autoSize, form.widthMode, form.paddingHorizontal, form.paddingVertical, form.alignment]);
  const key = JSON.stringify([code, form.height, form.width, form.autoSize, form.widthMode, form.paddingHorizontal, form.paddingVertical, form.alignment]);
  const iframeRef = useRef(null);
  const [measurement, setMeasurement] = useState(null);
  const height = sizing.autoSize && measurement?.key === key ? measurement.height : sizing.fallbackHeight;
  const directUrl = normalizeEmbedUrl(code);
  const html = useMemo(() => buildHtmlDocument(directUrl ? `<iframe src="${escapeAttribute(directUrl)}" width="100%" height="${Math.max(60,sizing.fallbackHeight-2*sizing.paddingVertical)}" style="border:0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>` : code, sizing, key), [code, directUrl, sizing, key]);
  useEffect(() => {
    const receive = event => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (sizing.autoSize && data?.type === "embed-size" && data.key === key && typeof data.height === "number" && Number.isFinite(data.height)) setMeasurement({ key, height: Math.max(80, Math.min(4000, Math.round(data.height))) });
    };
    window.addEventListener("message",receive);
    return () => window.removeEventListener("message",receive);
  }, [key, sizing.autoSize]);

  return (
    <div className="w-full rounded-[30px] border-4 border-slate-300 bg-slate-100 p-4 shadow-xl">
      <div className="mb-2 text-center">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
          Live app preview
        </span>
      </div>

      <div className="h-[690px] overflow-y-auto rounded-[24px] bg-[#F8FAFC] p-2">
        <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_28px_rgba(14,165,233,0.14)]">
          <div className="flex min-h-[66px] items-center gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-black text-slate-900">
                {form.title?.trim() || "Embed card title"}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Embedded content
              </p>
            </div>
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px] border border-slate-200 bg-slate-50 text-slate-900">
              <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4" />
              </svg>
            </div>
          </div>

          <div className="w-full overflow-hidden bg-white" style={{ height: `${height}px` }}>
            {!code ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">Paste embed HTML or a direct URL to preview it here.</div>
            ) : (
              <iframe ref={iframeRef} key={key} title="Embed preview" srcDoc={html} className="h-full w-full border-0" sandbox="allow-scripts allow-forms allow-popups allow-presentation" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            )}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs font-semibold text-slate-500">
          {sizing.autoSize ? "Auto Fit" : "Manual"} · Content height: {height} px
        </div>

        {directUrl && (
          <a href={directUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-sm font-semibold text-red-600 underline">Open link in browser</a>
        )}
        <p className="mt-2 px-2 text-center text-[11px] font-semibold leading-4 text-slate-400">
          Some providers block third-party iframe previews using their own security headers. Those embeds cannot be forced to load from the frontend.
        </p>
      </div>
    </div>
  );
};

