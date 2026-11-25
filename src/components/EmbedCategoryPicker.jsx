export default function EmbedCategoryPicker({ categories, value = [], onChange, ready }) {
  const selected = new Set(value);
  const missing = [...selected].filter((id) => !categories.some((cat) => cat._id === id));
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold">
        <input type="checkbox" checked={selected.size === 0} disabled={!ready} onChange={(e) => { if (e.target.checked) onChange([]); }} />
        All categories
      </label>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
        {!ready && <p className="p-2 text-sm text-slate-500">Categories unavailable or loading.</p>}
        {missing.map((id) => (
          <label key={id} className="flex items-center gap-2 rounded-lg p-2 text-sm text-red-600">
            <input type="checkbox" checked disabled={!ready} onChange={() => onChange([...selected].filter((item) => item !== id))} />
            Deleted or unavailable category — remove or replace
          </label>
        ))}
        {categories.map((cat) => (
          <label key={cat._id} className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={selected.has(cat._id)} disabled={!ready} onChange={(e) => onChange(e.target.checked ? [...selected, cat._id] : [...selected].filter((id) => id !== cat._id))} />
            {cat.name}
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-500">{selected.size ? `${selected.size} selected — only these categories` : "All categories — no category restriction"}</p>
    </div>
  );
}
