import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ol", "ul", "li", "h1", "h2", "blockquote", "span",
];

export const sanitizeRichText = (html = "") =>
  DOMPurify.sanitize(String(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onclick", "onload"],
  });
