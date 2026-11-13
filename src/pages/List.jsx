import React, { useCallback, useEffect, useMemo, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import PageHeader from "../components/admin/PageHeader";
import DataToolbar from "../components/admin/DataToolbar";
import TableShell from "../components/admin/TableShell";
import Pagination from "../components/admin/Pagination";
import usePagedList from "../hooks/usePagedList";

const COLUMNS = [
  { key: "image", label: "Image", width: "72px" },
  { key: "name", label: "Product name" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "sub", label: "Subcategory" },
  { key: "price", label: "Price" },
  { key: "actions", label: "Actions", className: "text-right" },
];

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const searchFn = useCallback((item, q) => {
    const hay = [
      item.name,
      item.sku,
      item.category,
      item.subCategory,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }, []);

  const filterFn = useCallback((item, filters) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.subCategory && item.subCategory !== filters.subCategory) {
      return false;
    }
    return true;
  }, []);

  const {
    query,
    setQuery,
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered,
    pageItems,
  } = usePagedList(list, { pageSize: 10, searchFn, filterFn });

  const categories = useMemo(() => {
    return [...new Set(list.map((p) => p.category).filter(Boolean))].sort();
  }, [list]);

  const subCategories = useMemo(() => {
    const source = filters.category
      ? list.filter((p) => p.category === filters.category)
      : list;
    return [
      ...new Set(source.map((p) => p.subCategory).filter(Boolean)),
    ].sort();
  }, [list, filters.category]);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id) => {
    if (removingId) return;
    if (!window.confirm("Remove this product?")) return;
    setRemovingId(id);
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Search, filter, and manage catalog items"
        count={totalFiltered}
        actions={
          <Link to="/add" className="admin-btn-primary">
            + Add product
          </Link>
        }
      />

      <DataToolbar
        searchPlaceholder="Search name, SKU, category…"
        query={query}
        onQueryChange={setQuery}
        onReset={resetFilters}
        filters={[
          {
            key: "category",
            label: "All categories",
            value: filters.category || "",
            onChange: (v) => {
              setFilter("category", v);
              setFilter("subCategory", "");
            },
            options: categories.map((c) => ({ value: c, label: c })),
          },
          {
            key: "subCategory",
            label: "All subcategories",
            value: filters.subCategory || "",
            onChange: (v) => setFilter("subCategory", v),
            options: subCategories.map((s) => ({ value: s, label: s })),
          },
        ]}
      />

      <TableShell
        columns={COLUMNS}
        loading={isLoading}
        empty={
          pageItems.length === 0
            ? list.length === 0
              ? "No products found"
              : "No products match your filters"
            : null
        }
      >
        {pageItems.map((item) => (
          <tr key={item._id}>
            <td className="admin-td">
              <img
                className="h-12 w-12 rounded-lg border border-slate-100 object-cover"
                src={item.image?.[0]}
                alt=""
              />
            </td>
            <td className="admin-td">
              <p className="font-medium text-slate-900">{item.name}</p>
            </td>
            <td className="admin-td">
              <span className="font-mono text-xs text-slate-500">
                {item.sku || "—"}
              </span>
            </td>
            <td className="admin-td">
              <span className="admin-badge bg-slate-100 text-slate-700">
                {item.category || "—"}
              </span>
            </td>
            <td className="admin-td text-slate-500">
              {item.subCategory || "—"}
            </td>
            <td className="admin-td font-semibold text-slate-900">
              {currency} {item.price}
            </td>
            <td className="admin-td">
              <div className="flex items-center justify-end gap-2">
                <Link
                  to={`/edit/${item._id}`}
                  state={{ product: item }}
                  className="admin-btn-link"
                >
                  Edit
                </Link>
                {removingId === item._id ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeProduct(item._id)}
                    className="admin-btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="products"
      />
    </div>
  );
};

export default List;
