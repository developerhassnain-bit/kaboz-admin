import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import PageHeader from "../components/admin/PageHeader";
import DataToolbar from "../components/admin/DataToolbar";
import Pagination from "../components/admin/Pagination";
import usePagedList from "../hooks/usePagedList";

const GROUP_OPTIONS = [
  { value: "fabric", label: "By Fabric" },
  { value: "style", label: "By Style" },
  { value: "weave", label: "By Weave & Pattern" },
  { value: "other", label: "Other" },
];

const emptySubDraft = () => ({
  name: "",
  description: "",
  group: "other",
  imageFile: null,
  imagePreview: "",
});

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [subDrafts, setSubDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingSub, setEditingSub] = useState(null);
  // editingSub: { categoryId, subId, name, description, group, image, imageFile, imagePreview }

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategories(response.data.categories);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const searchFn = useCallback((category, q) => {
    const subs = (category.subcategories || []).map((s) => s.name).join(" ");
    return `${category.name} ${subs}`.toLowerCase().includes(q);
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
  } = usePagedList(categories, { pageSize: 3, searchFn });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isAddingCategory) return;

    setIsAddingCategory(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/category/add",
        { name: newCategoryName.trim() },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNewCategoryName("");
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleRemoveCategory = async (id) => {
    if (busyId) return;
    if (!window.confirm("Delete this category and all its subcategories?"))
      return;

    setBusyId(id);
    try {
      const response = await axios.post(
        backendUrl + "/api/category/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const startEditingCategory = (category) => {
    setEditingCategoryId(category._id);
    setEditingCategoryName(category.name);
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const saveEditingCategory = async (id) => {
    if (!editingCategoryName.trim() || busyId) return;

    setBusyId(id);
    try {
      const response = await axios.post(
        backendUrl + "/api/category/update",
        { id, name: editingCategoryName.trim() },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        cancelEditingCategory();
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const updateSubDraft = (categoryId, patch) => {
    setSubDrafts((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] || emptySubDraft()), ...patch },
    }));
  };

  const handleAddSubcategory = async (categoryId) => {
    const draft = subDrafts[categoryId] || emptySubDraft();
    if (!draft.name.trim() || busyId) return;

    setBusyId(categoryId);
    try {
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("name", draft.name.trim());
      formData.append("description", draft.description || "");
      formData.append("group", draft.group || "other");
      if (draft.imageFile) formData.append("image", draft.imageFile);

      const response = await axios.post(
        backendUrl + "/api/category/subcategory/add",
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSubDrafts((prev) => ({ ...prev, [categoryId]: emptySubDraft() }));
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveSubcategory = async (categoryId, subcategoryId) => {
    if (busyId) return;
    if (!window.confirm("Delete this subcategory?")) return;

    setBusyId(subcategoryId);
    try {
      const response = await axios.post(
        backendUrl + "/api/category/subcategory/remove",
        { categoryId, subcategoryId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const startEditingSub = (categoryId, sub) => {
    setEditingSub({
      categoryId,
      subId: sub._id,
      name: sub.name || "",
      description: sub.description || "",
      group: sub.group || "other",
      image: sub.image || "",
      imageFile: null,
      imagePreview: sub.image || "",
    });
  };

  const cancelEditingSub = () => setEditingSub(null);

  const saveEditingSub = async () => {
    if (!editingSub || !editingSub.name.trim() || busyId) return;

    setBusyId(editingSub.subId);
    try {
      const formData = new FormData();
      formData.append("categoryId", editingSub.categoryId);
      formData.append("subcategoryId", editingSub.subId);
      formData.append("name", editingSub.name.trim());
      formData.append("description", editingSub.description || "");
      formData.append("group", editingSub.group || "other");
      if (editingSub.imageFile) {
        formData.append("image", editingSub.imageFile);
      } else if (editingSub.image) {
        formData.append("image", editingSub.image);
      }

      const response = await axios.post(
        backendUrl + "/api/category/subcategory/update",
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        cancelEditingSub();
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const groupLabel = (value) =>
    GROUP_OPTIONS.find((g) => g.value === value)?.label || "Other";

  return (
    <div className="w-full">
      <PageHeader
        title="Categories"
        subtitle="Organize products with categories and subcategories (Curtains browse groups appear on /living)"
        count={totalFiltered}
      />

      <form
        onSubmit={handleAddCategory}
        className="admin-card mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          disabled={isAddingCategory}
          className="admin-input flex-1"
        />
        <button
          type="submit"
          disabled={isAddingCategory}
          className="admin-btn-primary"
        >
          {isAddingCategory ? "Adding..." : "Add category"}
        </button>
      </form>

      <DataToolbar
        searchPlaceholder="Search categories or subcategories…"
        query={query}
        onQueryChange={setQuery}
        onReset={resetFilters}
        filters={[]}
      />

      <div className="mb-2 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1.4fr_1fr_120px] bg-slate-900 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          <div className="px-4 py-3">Category</div>
          <div className="hidden px-4 py-3 sm:block">Subcategories</div>
          <div className="px-4 py-3 text-right">Actions</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
          {categories.length === 0
            ? "No categories yet."
            : "No categories match your search."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((category) => {
            const draft = subDrafts[category._id] || emptySubDraft();
            return (
              <div key={category._id} className="admin-card">
                <div className="flex items-center justify-between gap-2">
                  {editingCategoryId === category._id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="admin-input flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditingCategory(category._id)}
                        disabled={busyId === category._id}
                        className="admin-btn-primary py-1.5 text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingCategory}
                        className="admin-btn-ghost py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {category.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {category.subcategories?.length || 0} subcategories
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditingCategory(category)}
                          className="admin-btn-link text-xs"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleRemoveCategory(category._id)}
                          disabled={busyId === category._id}
                          className="admin-btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-l-2 border-orange-100 pl-3">
                  {(!category.subcategories ||
                    category.subcategories.length === 0) && (
                    <p className="text-xs text-slate-400">
                      No subcategories yet.
                      {category.name === "Curtains"
                        ? " Restart the backend once to seed Living page groups."
                        : ""}
                    </p>
                  )}

                  {(category.subcategories || []).map((sub) => (
                    <div
                      key={sub._id}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
                    >
                      {editingSub?.subId === sub._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingSub.name}
                            onChange={(e) =>
                              setEditingSub((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="admin-input w-full py-1.5 text-xs"
                            placeholder="Name"
                          />
                          <textarea
                            value={editingSub.description}
                            onChange={(e) =>
                              setEditingSub((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="admin-input w-full py-1.5 text-xs"
                            rows={2}
                            placeholder="Description (shown on Living page)"
                          />
                          <select
                            value={editingSub.group}
                            onChange={(e) =>
                              setEditingSub((prev) => ({
                                ...prev,
                                group: e.target.value,
                              }))
                            }
                            className="admin-input w-full py-1.5 text-xs"
                          >
                            {GROUP_OPTIONS.map((g) => (
                              <option key={g.value} value={g.value}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap items-center gap-3">
                            {(editingSub.imagePreview || editingSub.image) && (
                              <img
                                src={
                                  editingSub.imagePreview || editingSub.image
                                }
                                alt=""
                                className="h-14 w-20 rounded-md object-cover border border-slate-200"
                              />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setEditingSub((prev) => ({
                                  ...prev,
                                  imageFile: file,
                                  imagePreview: URL.createObjectURL(file),
                                }));
                              }}
                              className="text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditingSub}
                              disabled={busyId === sub._id}
                              className="admin-btn-primary py-1 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingSub}
                              className="admin-btn-ghost py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            {sub.image ? (
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="h-12 w-16 flex-shrink-0 rounded-md object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-200 text-[10px] text-slate-500">
                                No img
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800">
                                {sub.name}
                              </p>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                                {groupLabel(sub.group)}
                              </p>
                              {sub.description ? (
                                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                  {sub.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() =>
                                startEditingSub(category._id, sub)
                              }
                              className="admin-btn-link text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveSubcategory(
                                  category._id,
                                  sub._id
                                )
                              }
                              disabled={busyId === sub._id}
                              className="text-xs font-semibold text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add subcategory */}
                  <div className="mt-1 space-y-2 rounded-lg border border-dashed border-slate-200 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Add subcategory
                    </p>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) =>
                        updateSubDraft(category._id, { name: e.target.value })
                      }
                      placeholder="Name"
                      className="admin-input w-full py-1.5 text-xs"
                    />
                    <textarea
                      value={draft.description}
                      onChange={(e) =>
                        updateSubDraft(category._id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (optional)"
                      rows={2}
                      className="admin-input w-full py-1.5 text-xs"
                    />
                    <select
                      value={draft.group}
                      onChange={(e) =>
                        updateSubDraft(category._id, { group: e.target.value })
                      }
                      className="admin-input w-full py-1.5 text-xs"
                    >
                      {GROUP_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap items-center gap-2">
                      {draft.imagePreview ? (
                        <img
                          src={draft.imagePreview}
                          alt=""
                          className="h-12 w-16 rounded object-cover"
                        />
                      ) : null}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          updateSubDraft(category._id, {
                            imageFile: file,
                            imagePreview: URL.createObjectURL(file),
                          });
                        }}
                        className="text-xs"
                      />
                      <button
                        onClick={() => handleAddSubcategory(category._id)}
                        disabled={busyId === category._id}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="categories"
        pageSizeOptions={[2, 3, 5]}
      />
    </div>
  );
};

export default Categories;
