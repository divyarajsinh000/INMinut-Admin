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
  return url.href;
}

const buildHtmlDocument = (html = "") => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
    <style>
      html, body {
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        overflow: auto;
        background: transparent;
      }
      *, *::before, *::after { box-sizing: border-box; }
      iframe, video, embed, object, img, svg, canvas {
        max-width: 100% !important;
      }
      iframe, video, embed, object {
        width: 100% !important;
        border: 0;
      }
    </style>
  </head>
  <body>${html}</body>
</html>`;

const getPreviewData = (value = "") => {
  const code = typeof value === "string" ? value.trim() : "";

  if (!code) return { type: "empty", value: "" };

  // A directly pasted link.
  const directUrl = normalizeEmbedUrl(code);
  if (directUrl) return { type: "url", value: directUrl };

  // Generic HTML, script widgets, blockquotes, video tags and other snippets.
  return {
    type: "html",
    value: buildHtmlDocument(code),
  };
};

export default function EmbedAppPreview({ form }) {
  const height = Math.max(80, Number(form.height) || 250);
  const preview = getPreviewData(form.embedCode);

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
            {preview.type === "empty" ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">
                Paste embed HTML or a direct URL to preview it here.
              </div>
            ) : preview.type === "url" ? (
              <iframe
                key={preview.value}
                title="Embed URL preview"
                src={preview.value}
                sandbox="allow-scripts allow-forms allow-popups allow-presentation"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <iframe
                key={preview.value}
                title="Embed HTML preview"
                srcDoc={preview.value}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-forms allow-popups allow-presentation"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs font-semibold text-slate-500">
          App card height: {height} px
        </div>

        {preview.type === "url" && (
          <a href={preview.value} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-sm font-semibold text-red-600 underline">Open link in browser</a>
        )}
        <p className="mt-2 px-2 text-center text-[11px] font-semibold leading-4 text-slate-400">
          Some providers block third-party iframe previews using their own security headers. Those embeds cannot be forced to load from the frontend.
        </p>
      </div>
    </div>
  );
};

