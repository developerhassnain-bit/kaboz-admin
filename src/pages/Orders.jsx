import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import PageHeader from "../components/admin/PageHeader";
import DataToolbar from "../components/admin/DataToolbar";
import Pagination from "../components/admin/Pagination";
import usePagedList from "../hooks/usePagedList";

const STATUS_OPTIONS = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out of delivery",
  "Delivered",
];

const statusColor = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-700";
    case "Shipped":
    case "Out of delivery":
      return "bg-sky-100 text-sky-700";
    case "Packing":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const searchFn = useCallback((order, q) => {
    const name = `${order.address?.firstName || ""} ${order.address?.lastName || ""}`;
    const items = (order.items || []).map((i) => i.name).join(" ");
    const hay = [
      name,
      order.address?.phone,
      order.address?.city,
      order.paymentMethod,
      order.status,
      items,
      order._id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }, []);

  const filterFn = useCallback((order, filters) => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.payment === "paid" && !order.payment) return false;
    if (filters.payment === "pending" && order.payment) return false;
    if (filters.method && order.paymentMethod !== filters.method) return false;
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
  } = usePagedList(orders, { pageSize: 10, searchFn, filterFn });

  const fetchAllOrders = async () => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const raw = response.data.orders || [];
        setOrders([...raw].reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track payments, shipping status, and customer details"
        count={totalFiltered}
      />

      <DataToolbar
        searchPlaceholder="Search customer, phone, product, order…"
        query={query}
        onQueryChange={setQuery}
        onReset={resetFilters}
        filters={[
          {
            key: "status",
            label: "All statuses",
            value: filters.status || "",
            onChange: (v) => setFilter("status", v),
            options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
          },
          {
            key: "payment",
            label: "All payments",
            value: filters.payment || "",
            onChange: (v) => setFilter("payment", v),
            options: [
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
            ],
          },
          {
            key: "method",
            label: "All methods",
            value: filters.method || "",
            onChange: (v) => setFilter("method", v),
            options: [
              { value: "COD", label: "COD" },
              { value: "Stripe", label: "Stripe" },
            ],
          },
        ]}
      />

      {/* Column legend / header strip */}
      <div className="mb-2 hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
        <div className="grid grid-cols-[56px_2.2fr_1fr_0.8fr_1.2fr] bg-slate-900 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          <div className="px-4 py-3">Pkg</div>
          <div className="px-4 py-3">Customer & items</div>
          <div className="px-4 py-3">Payment</div>
          <div className="px-4 py-3">Amount</div>
          <div className="px-4 py-3">Status</div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
            {orders.length === 0
              ? "No orders found"
              : "No orders match your filters"}
          </div>
        ) : (
          pageItems.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 sm:p-5 lg:grid-cols-[56px_2.2fr_1fr_0.8fr_1.2fr] lg:items-start"
            >
              <img
                className="h-12 w-12 rounded-lg bg-slate-50 p-1.5"
                src={assets.parcel_icon}
                alt=""
              />

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                  Customer & items
                </p>
                <div className="space-y-0.5 text-sm text-slate-600">
                  {(order.items || []).map((item, index) => (
                    <p key={index}>
                      {item.name} × {item.quantity}
                      {item.size ? <span> ({item.size})</span> : null}
                      {item.sku || item.selectedColor ? (
                        <span className="text-slate-700">
                          {" "}
                          · SKU: {item.sku || item.selectedColor}
                        </span>
                      ) : null}
                      {item.selectedColor ? (
                        <span className="text-orange-600">
                          {" "}
                          · Color: {item.selectedColor}
                        </span>
                      ) : null}
                      {item.selectedDesign ? (
                        <span className="text-slate-500">
                          {" "}
                          · Design: {item.selectedDesign}
                        </span>
                      ) : null}
                    </p>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-slate-900">
                  {order.address?.firstName} {order.address?.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  {order.address?.street}
                </p>
                <p className="text-sm text-slate-500">
                  {[
                    order.address?.city,
                    order.address?.state,
                    order.address?.country,
                    order.address?.zipcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-sm text-slate-500">{order.address?.phone}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                  Payment
                </p>
                <p className="text-sm text-slate-700">
                  Items: <span className="font-medium">{order.items?.length || 0}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Method:{" "}
                  <span className="font-medium">{order.paymentMethod}</span>
                </p>
                <p className="mt-1">
                  <span
                    className={`admin-badge ${
                      order.payment
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.payment ? "Paid" : "Pending"}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                  Amount
                </p>
                <p className="text-base font-bold text-slate-900">
                  {currency} {order.amount}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                  Status
                </p>
                <span className={`admin-badge mb-2 ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    disabled={updatingOrderId === order._id}
                    className="admin-input w-full font-semibold disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order._id && (
                    <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="orders"
      />
    </div>
  );
};

export default Orders;
