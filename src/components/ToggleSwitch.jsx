const ToggleSwitch = ({
  checked,
  onChange,
  label,
  title,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
          checked ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
        }`}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
      <span
        className={`text-sm font-bold ${
          checked ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label !== undefined ? label : checked ? "On" : "Off"}
      </span>
    </button>
  );
};

export default ToggleSwitch;
