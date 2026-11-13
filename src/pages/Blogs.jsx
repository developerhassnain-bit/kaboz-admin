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
  excerpt: "",
  category: "Security",
  author: "Kaboz Team",
  image: "",
  imageFile: null,
  content: "",
  isPublished: true,
});

const Blogs = ({ token }) => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const searchFn = useCallback((item, q) => {
    return [item.title, item.category, item.author, item.excerpt]
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
  } = usePagedList(blogs, { pageSize: 10, searchFn });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/blog/list");
      if (response.data.success) {
        setBlogs(response.data.blogs || []);
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
    fetchBlogs();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (blog) => {
    setForm({
      id: blog._id,
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      category: blog.category || "General",
      author: blog.author || "Kaboz Team",
      image: blog.image || "",
      imageFile: null,
      content: (blog.content || []).join("\n\n"),
      isPublished: blog.isPublished !== false,
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
      data.append("excerpt", form.excerpt.trim());
      data.append("category", form.category.trim());
      data.append("author", form.author.trim());
      data.append("content", form.content);
      data.append("imageUrl", form.image.trim());
      data.append("isPublished", String(form.isPublished));
      if (form.imageFile) data.append("image", form.imageFile);

      const url = form.id
        ? backendUrl + "/api/blog/update"
        : backendUrl + "/api/blog/add";

      const response = await axios.post(url, data, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
        setForm(emptyForm());
        await fetchBlogs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeBlog = async (id) => {
    if (removingId) return;
    if (!window.confirm("Remove this blog post?")) return;
    setRemovingId(id);
    try {
      const response = await axios.post(
        backendUrl + "/api/blog/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchBlogs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div>
      <PageHeader
        title="Blogs"
        subtitle="Create, edit, and remove storefront blog posts"
        count={blogs.length}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            + Add blog
          </button>
        }
      />

      <DataToolbar
        query={query}
        onQueryChange={setQuery}
        onReset={resetFilters}
        searchPlaceholder="Search blogs…"
      />

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              {form.id ? "Edit blog" : "New blog"}
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

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Category</span>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Author</span>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Excerpt</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Content (separate paragraphs with a blank line)
              </span>
              <textarea
                rows={8}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400"
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

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
              />
              <span className="font-medium text-slate-700">Published</span>
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
              {saving ? "Saving…" : form.id ? "Update blog" : "Create blog"}
            </button>
          </div>
        </form>
      )}

      <TableShell
        columns={[
          { key: "image", label: "Image", width: "72px" },
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date" },
          { key: "actions", label: "Actions", className: "text-right" },
        ]}
        loading={isLoading}
        empty={
          !isLoading && pageItems.length === 0
            ? "No blogs yet. Add your first post."
            : null
        }
      >
        {pageItems.map((blog) => (
          <tr key={blog._id} className="border-t border-slate-100">
            <td className="px-3 py-2.5">
              {blog.image ? (
                <img
                  src={blog.image}
                  alt=""
                  className="h-10 w-14 rounded object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </td>
            <td className="px-3 py-2.5">
              <p className="font-medium text-slate-900 line-clamp-2">{blog.title}</p>
              <p className="text-xs text-slate-400">{blog.slug}</p>
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-600">{blog.category}</td>
            <td className="px-3 py-2.5">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  blog.isPublished
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {blog.isPublished ? "Published" : "Draft"}
              </span>
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-500">
              {formatDate(blog.date)}
            </td>
            <td className="px-3 py-2.5 text-right">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(blog)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={removingId === blog._id}
                  onClick={() => removeBlog(blog._id)}
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

export default Blogs;
