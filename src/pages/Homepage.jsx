import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import PageHeader from "../components/admin/PageHeader";

const PRODUCT_PICKERS = [
  {
    field: "dealProductIds",
    title: "Deal of the day products",
    help: "Products in the Deal of the day carousel (max 24). Leave empty to auto-pick discounted items.",
  },
  {
    field: "featureTabProductIds",
    title: "Feature tab products",
    help: "Products for the Feature tab. Empty = auto from featured/bestsellers.",
  },
  {
    field: "bestSellingTabProductIds",
    title: "Best Selling tab products",
    help: "Products for the Best Selling tab. Empty = auto from bestsellers.",
  },
  {
    field: "onSaleTabProductIds",
    title: "On Sale tab products",
    help: "Products for the On Sale tab. Empty = auto from discounted items.",
  },
  {
    field: "bestsellerProductIds",
    title: "Best Seller grid (2 rows)",
    help: "Products in the Best Seller 5×2 grid (max 24). Also syncs the bestseller flag on products.",
  },
  {
    field: "top20ProductIds",
    title: "Top 20 column",
    help: "Products for the Top 20 column. Empty = auto.",
  },
  {
    field: "featuredColumnProductIds",
    title: "Featured products column",
    help: "Products for the Featured column. Empty = auto.",
  },
  {
    field: "topSellingColumnProductIds",
    title: "Top selling products column",
    help: "Products for the Top selling column. Empty = auto.",
  },
  {
    field: "onSaleColumnProductIds",
    title: "On-sale products column",
    help: "Products for the On-sale column. Empty = auto.",
  },
];

const moveItem = (list, index, direction) => {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next.map((item, i) =>
    typeof item === "object" && item !== null ? { ...item, order: i } : item
  );
};

const emptyProductLists = () =>
  Object.fromEntries(PRODUCT_PICKERS.map((p) => [p.field, []]));

const ProductPicker = ({
  title,
  help,
  ids,
  setIds,
  products,
  productMap,
}) => {
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => ids.map((id) => productMap[id]).filter(Boolean),
    [ids, productMap]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(ids);
    return products
      .filter((p) => !taken.has(String(p._id)))
      .filter((p) => {
        if (!q) return true;
        return [p.name, p.category, p.sku]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 30);
  }, [products, ids, query]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{help}</p>
      </div>

      {selected.length === 0 ? (
        <p className="mb-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">
          No products selected — storefront will auto-fill this block.
        </p>
      ) : (
        <ul className="mb-4 space-y-2">
          {selected.map((p, index) => (
            <li
              key={p._id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIds((prev) => moveItem(prev, index, -1))}
                  className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setIds((prev) => moveItem(prev, index, 1))}
                  className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ↓
                </button>
              </div>
              {p.image?.[0] ? (
                <img
                  src={p.image[0]}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {p.name}
                </p>
                <p className="text-xs text-slate-400">
                  {p.category} · {currency} {p.price}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setIds((prev) => prev.filter((x) => x !== String(p._id)))
                }
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add…"
          className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <ul className="max-h-48 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-2 py-4 text-center text-xs text-slate-400">
              No matching products
            </li>
          ) : (
            filtered.map((p) => (
              <li
                key={p._id}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white"
              >
                {p.image?.[0] ? (
                  <img
                    src={p.image[0]}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-slate-200" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setIds((prev) =>
                      prev.includes(String(p._id))
                        ? prev
                        : [...prev, String(p._id)].slice(0, 24)
                    )
                  }
                  className="rounded-md bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-700"
                >
                  Add
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
};

const Homepage = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [productLists, setProductLists] = useState(emptyProductLists);
  const [products, setProducts] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, productsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/homepage/settings`),
        axios.get(`${backendUrl}/api/product/list`),
      ]);

      if (!settingsRes.data.success) {
        toast.error(settingsRes.data.message || "Failed to load settings");
        return;
      }

      const settings = settingsRes.data.settings;
      setSections(
        (settings.sections || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((s, i) => ({ ...s, order: i }))
      );

      const nextLists = emptyProductLists();
      PRODUCT_PICKERS.forEach(({ field }) => {
        nextLists[field] = (settings[field] || []).map(String);
      });
      setProductLists(nextLists);

      if (productsRes.data.success) {
        setProducts(productsRes.data.products || []);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[String(p._id)] = p;
    });
    return map;
  }, [products]);

  const setListField = (field) => (updater) => {
    setProductLists((prev) => ({
      ...prev,
      [field]:
        typeof updater === "function" ? updater(prev[field] || []) : updater,
    }));
  };

  const toggleSection = (index) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append(
        "sections",
        JSON.stringify(
          sections.map((s, i) => ({
            key: s.key,
            label: s.label,
            enabled: !!s.enabled,
            order: i,
          }))
        )
      );

      PRODUCT_PICKERS.forEach(({ field }) => {
        data.append(field, JSON.stringify(productLists[field] || []));
      });

      const response = await axios.post(
        `${backendUrl}/api/homepage/update`,
        data,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Saved");
        await fetchAll();
      } else {
        toast.error(response.data.message || "Save failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-16 text-center text-sm text-slate-500">
        Loading homepage settings…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <PageHeader
        title="Homepage"
        subtitle="Control homepage blocks — visibility, order, and curated products"
        actions={
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {/* Sections */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Homepage sections
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Enable, disable, or reorder blocks on the storefront homepage.
          </p>
        </div>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {sections.map((section, index) => (
            <li
              key={section.key}
              className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSections((s) => moveItem(s, index, -1))}
                  className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setSections((s) => moveItem(s, index, 1))}
                  className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {section.label || section.key}
                </p>
                <p className="text-xs text-slate-400">{section.key}</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={!!section.enabled}
                  onChange={() => toggleSection(index)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Visible
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Product pickers for each curated block */}
      {PRODUCT_PICKERS.map((picker) => (
        <ProductPicker
          key={picker.field}
          title={picker.title}
          help={picker.help}
          ids={productLists[picker.field] || []}
          setIds={setListField(picker.field)}
          products={products}
          productMap={productMap}
        />
      ))}

      <div className="flex justify-end pb-8">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save homepage settings"}
        </button>
      </div>
    </form>
  );
};

export default Homepage;
