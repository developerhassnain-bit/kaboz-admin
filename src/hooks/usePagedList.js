import { useMemo, useState, useEffect } from "react";

/**
 * Client-side search + filter + pagination for admin tables.
 * @param {Array} items
 * @param {{ pageSize?: number, filterFn?: (item, filters) => boolean, searchFn?: (item, query) => boolean }} options
 */
export default function usePagedList(items = [], options = {}) {
  const {
    pageSize: initialPageSize = 10,
    filterFn,
    searchFn,
  } = options;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    let next = Array.isArray(items) ? items : [];
    const q = query.trim().toLowerCase();

    if (q && searchFn) {
      next = next.filter((item) => searchFn(item, q));
    }

    if (filterFn) {
      next = next.filter((item) => filterFn(item, filters));
    }

    return next;
  }, [items, query, filters, searchFn, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, filters, pageSize, items.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setQuery("");
    setFilters({});
    setPage(1);
  };

  return {
    query,
    setQuery,
    filters,
    setFilter,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered: filtered.length,
    totalAll: items.length,
    pageItems,
    filtered,
  };
}
