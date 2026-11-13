import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import PageHeader from "../components/admin/PageHeader";
import DataToolbar from "../components/admin/DataToolbar";
import TableShell from "../components/admin/TableShell";
import Pagination from "../components/admin/Pagination";
import usePagedList from "../hooks/usePagedList";

const emptyForm = () => ({
  id: null,
  title: "",
  shortDescription: "",
  image: "",
  imageFile: null,
  whatsappMessage: "",
  overview: "",
  details: "",
  idealFor: "",
  sortOrder: 0,
  isActive: true,
});

const Services = ({ token }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const searchFn = useCallback((item, q) => {
    return [item.title, item.shortDescription, item.idealFor]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  }, []);

  const {
    query,
    setQuery,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered,
    pageItems,
  } = usePagedList(services, { pageSize: 10, searchFn });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/service/list");
      if (response.data.success) {
        setServices(response.data.services || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm(), sortOrder: services.length });
    setShowForm(true);
  };

  const openEdit = (service) => {
    setForm({
      id: service._id,
      title: service.title || "",
      shortDescription: service.shortDescription || "",
      image: service.image || "",
      imageFile: null,
      whatsappMessage: service.whatsappMessage || "",
      overview: service.overview || "",
      details: (service.details || []).join("\n"),
      idealFor: service.idealFor || "",
      sortOrder: service.sortOrder ?? 0,
      isActive: service.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true);

    try {
      const data = new FormData();
      if (form.id) data.append("id", form.id);
      data.append("title", form.title.trim());
      data.append("shortDescription", form.shortDescription.trim());
      data.append("whatsappMessage", form.whatsappMessage.trim());
      data.append("overview", form.overview.trim());
      data.append("details", form.details);
      data.append("idealFor", form.idealFor.trim());
      data.append("sortOrder", String(form.sortOrder));
      data.append("imageUrl", form.image.trim());
      data.append("isActive", String(form.isActive));
      if (form.imageFile) data.append("image", form.imageFile);

      const url = form.id
        ? backendUrl + "/api/service/update"
        : backendUrl + "/api/service/add";

      const response = await axios.post(url, data, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
        setForm(emptyForm());
        await fetchServices();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (id) => {
    if (removingId) return;
    if (!window.confirm("Remove this service?")) return;
    setRemovingId(id);
    try {
      const response = await axios.post(
        backendUrl + "/api/service/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchServices();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Manage service offerings shown on the storefront"
        count={services.length}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            + Add service
          </button>
        }
      />

      <DataToolbar
        query={query}
        onQueryChange={setQuery}
        onReset={resetFilters}
        searchPlaceholder="Search services…"
      />

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              {form.id ? "Edit service" : "New service"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Short description
              </span>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shortDescription: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Overview</span>
              <textarea
                rows={3}
                value={form.overview}
                onChange={(e) =>
                  setForm((f) => ({ ...f, overview: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Details (one item per line)
              </span>
              <textarea
                rows={6}
                value={form.details}
                onChange={(e) =>
                  setForm((f) => ({ ...f, details: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Ideal for</span>
              <textarea
                rows={2}
                value={form.idealFor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, idealFor: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                WhatsApp message
              </span>
              <textarea
                rows={2}
                value={form.whatsappMessage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, whatsappMessage: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Image URL
              </span>
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Or upload image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageFile: e.target.files?.[0] || null,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Sort order
              </span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="flex items-center gap-2 text-sm self-end pb-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              <span className="font-medium text-slate-700">Active on storefront</span>
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Update service" : "Create service"}
            </button>
          </div>
        </form>
      )}

      <TableShell
        columns={[
          { key: "image", label: "Image", width: "72px" },
          { key: "title", label: "Service" },
          { key: "order", label: "Order" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions", className: "text-right" },
        ]}
        loading={isLoading}
        empty={
          !isLoading && pageItems.length === 0
            ? "No services yet. Add your first service."
            : null
        }
      >
        {pageItems.map((service) => (
          <tr key={service._id} className="border-t border-slate-100">
            <td className="px-3 py-2.5">
              {service.image ? (
                <img
                  src={service.image}
                  alt=""
                  className="h-10 w-14 rounded object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </td>
            <td className="px-3 py-2.5">
              <p className="font-medium text-slate-900">{service.title}</p>
              <p className="line-clamp-1 text-xs text-slate-400">
                {service.shortDescription}
              </p>
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-600">
              {service.sortOrder}
            </td>
            <td className="px-3 py-2.5">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  service.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {service.isActive ? "Active" : "Hidden"}
              </span>
            </td>
            <td className="px-3 py-2.5 text-right">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(service)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={removingId === service._id}
                  onClick={() => removeService(service._id)}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
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
      />
    </div>
  );
};

export default Services;
