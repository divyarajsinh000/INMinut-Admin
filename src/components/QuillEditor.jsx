import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const QuillEditor = ({ value, onChange }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onValueChangeRef = useRef(onChange);

  // Keep callback ref fresh to avoid re-triggering effect
  useEffect(() => {
    onValueChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || quillRef.current) return;

    // Create container inside the div
    const editorDiv = document.createElement("div");
    container.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    quillRef.current = quill;

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    const handleTextChange = () => {
      const html = quill.root.innerHTML;
      if (onValueChangeRef.current) {
        // Only trigger change if it's different from the current value
        onValueChangeRef.current(html === "<p><br></p>" ? "" : html);
      }
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
      container.innerHTML = "";
      quillRef.current = null;
    };
  }, []);

  // Update content externally if needed
  useEffect(() => {
    if (quillRef.current) {
      const currentHtml = quillRef.current.root.innerHTML;
      const normalizedValue = value || "";
      if (normalizedValue !== currentHtml && normalizedValue !== "" && normalizedValue !== "<p><br></p>") {
        quillRef.current.clipboard.dangerouslyPasteHTML(normalizedValue);
      }
    }
  }, [value]);

  return <div ref={containerRef} className="quill-editor-container" />;
};

export default QuillEditor;
