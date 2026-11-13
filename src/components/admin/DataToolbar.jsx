import React from "react";

const DataToolbar = ({
  searchPlaceholder = "Search…",
  query,
  onQueryChange,
  filters = [],
  onReset,
  showReset = true,
  rightSlot,
}) => {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value ?? ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="admin-input min-w-[140px]"
              aria-label={filter.label}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {showReset && (
            <button type="button" onClick={onReset} className="admin-btn-ghost">
              Reset
            </button>
          )}

          {rightSlot}
        </div>
      </div>
    </div>
  );
};

export default DataToolbar;
