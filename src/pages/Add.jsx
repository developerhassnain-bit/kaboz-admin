import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import RichTextEditor from "../components/RichTextEditor";
import { toast } from "react-toastify";
import CurtainTypesEditor from "../components/CurtainTypesEditor";
import PageHeader from "../components/admin/PageHeader";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [curtainTypes, setCurtainTypes] = useState([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [bestseller, setBestseller] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategories(response.data.categories);
        if (response.data.categories.length > 0) {
          setCategory(response.data.categories[0].name);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset subcategory whenever the selected category changes
  useEffect(() => {
    setSubCategory("");
  }, [category]);

  const selectedCategoryData = categories.find((c) => c.name === category);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // guard against double submits

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("shortDescription", shortDescription);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("originalPrice", originalPrice);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);
      formData.append("metaKeywords", metaKeywords);
      formData.append("sku", sku);
      formData.append("brand", brand);
      formData.append("modelName", modelName);

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      if (category === "Curtains") {
        const typesForJson = curtainTypes.map((type) => ({
          name: type.name,
          colors: type.colors.map((color) => ({ code: color.code })),
        }));
        formData.append("curtainTypes", JSON.stringify(typesForJson));

        curtainTypes.forEach((type, typeIndex) => {
          if (type.thumbnailFile) {
            formData.append(
              `curtainTypeThumbnail_${typeIndex}`,
              type.thumbnailFile
            );
          }

          type.colors.forEach((color, colorIndex) => {
            if (color.imageFile) {
              formData.append(
                `curtainColorImage_${typeIndex}_${colorIndex}`,
                color.imageFile
              );
            }
          });
        });
      }

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setShortDescription("");
        setDescription("");
        setCurtainTypes([]);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setOriginalPrice("");
        setSubCategory("");
        setMetaTitle("");
        setMetaDescription("");
        setMetaKeywords("");
        setSku("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);

      console.error(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex w-full max-w-3xl flex-col items-start gap-4"
    >
      <PageHeader
        title="Add product"
        subtitle="Upload images and fill in catalog details"
      />
      <div className="admin-card w-full">
        <p className="mb-2 text-sm font-semibold text-slate-800">Upload images</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img
              className="w-20"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt=""
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
              disabled={isSubmitting}
            />
          </label>
          <label htmlFor="image2">
            <img
              className="w-20"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt=""
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
              disabled={isSubmitting}
            />
          </label>
          <label htmlFor="image3">
            <img
              className="w-20"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt=""
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
              disabled={isSubmitting}
            />
          </label>
          <label htmlFor="image4">
            <img
              className="w-20"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt=""
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
              disabled={isSubmitting}
            />
          </label>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Short description (bullet points)</p>
        <p className="text-xs text-gray-500 mb-2">
          One point per line — shown as a bullet list under the product title.
        </p>
        <textarea
          onChange={(e) => setShortDescription(e.target.value)}
          value={shortDescription}
          className="w-full max-w-[500px] px-3 py-2"
          rows={5}
          placeholder={
            "48 x Gigabit PoE Ports\nTotal PoE Power Budget 470W\nSupports IEEE 802.1Q VLAN tagging"
          }
          disabled={isSubmitting}
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <p className="mb-2">Product category</p>
          {isLoadingCategories ? (
            <p className="text-xs text-gray-400">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-xs text-red-500">
              No categories yet — add one in the Categories tab first.
            </p>
          ) : (
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="w-full px-3 py-2 border rounded"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {availableSubcategories.length > 0 && (
            <div className="mt-3">
              <p className="mb-2">Subcategory (optional)</p>
              <select
                onChange={(e) => setSubCategory(e.target.value)}
                value={subCategory}
                className="w-full px-3 py-2 border rounded"
                disabled={isSubmitting}
              >
                <option value="">None</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub._id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {category === "Curtains" && (
            <CurtainTypesEditor
              curtainTypes={curtainTypes}
              setCurtainTypes={setCurtainTypes}
              disabled={isSubmitting}
            />
          )}
        </div>

        <div>
          <p className="mb-2">Selling Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 border rounded"
            type="number"
            placeholder="25"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <p className="mb-2">Original Price (optional)</p>
          <input
            onChange={(e) => setOriginalPrice(e.target.value)}
            value={originalPrice}
            className="w-full px-3 py-2 border rounded"
            type="number"
            placeholder="e.g. 35"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for no discount shown.
          </p>
        </div>

        <div>
          <p className="mb-2">Product Code (SKU)</p>
          <input
            onChange={(e) => setSku(e.target.value)}
            value={sku}
            className="w-full px-3 py-2 border rounded"
            type="text"
            placeholder="e.g. DS-2CD2143G2 / CCTV-001"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Save the product code here in the SKU field.
          </p>
        </div>

        <div>
          <p className="mb-2">Brand</p>
          <input
            onChange={(e) => setBrand(e.target.value)}
            value={brand}
            className="w-full px-3 py-2 border rounded"
            type="text"
            placeholder="e.g. Hikvision"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <p className="mb-2">Model name</p>
          <input
            onChange={(e) => setModelName(e.target.value)}
            value={modelName}
            className="w-full px-3 py-2 border rounded"
            type="text"
            placeholder="e.g. DS-2CD2143G2-I"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          disabled={isSubmitting}
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <div className="w-full border-t pt-4 mt-2">
        <p className="mb-3 font-medium text-gray-700">SEO Meta Details</p>

        <div className="w-full mb-3">
          <p className="mb-2">Meta Title</p>
          <input
            onChange={(e) => setMetaTitle(e.target.value)}
            value={metaTitle}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Defaults to product name if left blank"
            disabled={isSubmitting}
          />
        </div>

        <div className="w-full mb-3">
          <p className="mb-2">Meta Description</p>
          <textarea
            onChange={(e) => setMetaDescription(e.target.value)}
            value={metaDescription}
            className="w-full max-w-[500px] px-3 py-2"
            placeholder="Defaults to product description if left blank"
            disabled={isSubmitting}
          />
        </div>

        <div className="w-full">
          <p className="mb-2">Meta Keywords</p>
          <input
            onChange={(e) => setMetaKeywords(e.target.value)}
            value={metaKeywords}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Comma-separated, e.g. cctv camera, dubai, security"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-28 py-3 mt-4 bg-black text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          "ADD"
        )}
      </button>
    </form>
  );
};

export default Add;