import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import RichTextEditor from "../components/RichTextEditor";
import CurtainTypesEditor from "../components/CurtainTypesEditor";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const existingProduct = location.state?.product;

  if (!existingProduct) {
    navigate("/list");
    return null;
  }

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState(existingProduct.name);
  const [shortDescription, setShortDescription] = useState(
    existingProduct.shortDescription || "",
  );
  const [description, setDescription] = useState(existingProduct.description);
  const [price, setPrice] = useState(existingProduct.price);
  const [sku, setSku] = useState(existingProduct.sku || "");
  const [brand, setBrand] = useState(existingProduct.brand || "");
  const [modelName, setModelName] = useState(existingProduct.modelName || "");
  const [originalPrice, setOriginalPrice] = useState(
    existingProduct.originalPrice || "",
  );

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [category, setCategory] = useState(existingProduct.category);
  const [subCategory, setSubCategory] = useState(
    existingProduct.subCategory || "",
  );
  const [hasInitializedSub, setHasInitializedSub] = useState(false);

  const [bestseller, setBestseller] = useState(existingProduct.bestseller);
  const [metaTitle, setMetaTitle] = useState(existingProduct.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    existingProduct.metaDescription || "",
  );
  const [metaKeywords, setMetaKeywords] = useState(
    existingProduct.metaKeywords || "",
  );
  const [curtainTypes, setCurtainTypes] = useState(
    (existingProduct.curtainTypes || []).map((type) => ({
      name: type.name,
      thumbnail: type.thumbnail,
      thumbnailFile: null,
      thumbnailPreview: "",
      colors: (type.colors || []).map((color) => ({
        code: color.code,
        image: color.image,
        imageFile: null,
        imagePreview: "",
      })),
    })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingImages = existingProduct.image || [];

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
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
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset subcategory when the category changes — but skip the very
  // first run, so the product's existing subCategory isn't wiped out
  // just because categories finished loading.
  useEffect(() => {
    if (!hasInitializedSub) {
      setHasInitializedSub(true);
      return;
    }
    setSubCategory("");
  }, [category]);

  const selectedCategoryData = categories.find(
    (c) => c.name.trim().toLowerCase() === category?.trim().toLowerCase(),
  );
  const availableSubcategories = selectedCategoryData?.subcategories || [];
  console.log("Product category:", JSON.stringify(category));
  console.log(
    "Available category names:",
    categories.map((c) => JSON.stringify(c.name)),
  );
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", id);
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
              type.thumbnailFile,
            );
          }

          type.colors.forEach((color, colorIndex) => {
            if (color.imageFile) {
              formData.append(
                `curtainColorImage_${typeIndex}_${colorIndex}`,
                color.imageFile,
              );
            }
          });
        });
      }

      const response = await axios.post(
        backendUrl + "/api/product/update",
        formData,
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Image</p>
        <p className="text-xs text-gray-500 mb-2">
          Leave a slot unchanged to keep the existing image.
        </p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img
              className="w-20"
              src={
                image1
                  ? URL.createObjectURL(image1)
                  : existingImages[0] || assets.upload_area
              }
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
              src={
                image2
                  ? URL.createObjectURL(image2)
                  : existingImages[1] || assets.upload_area
              }
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
              src={
                image3
                  ? URL.createObjectURL(image3)
                  : existingImages[2] || assets.upload_area
              }
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
              src={
                image4
                  ? URL.createObjectURL(image4)
                  : existingImages[3] || assets.upload_area
              }
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

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          {isLoadingCategories ? (
            <p className="text-xs text-gray-400">Loading categories...</p>
          ) : (
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="w-full px-3 py-2"
              disabled={isSubmitting}
            >
              {!categories.some(
                (cat) =>
                  cat.name.trim().toLowerCase() ===
                  category?.trim().toLowerCase(),
              ) && (
                <option value={category} disabled>
                  {category} (no longer exists — please choose a category)
                </option>
              )}
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
                className="w-full px-3 py-2"
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
        </div>

        <div>
          <p className="mb-2">Selling Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
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
            className="w-full px-3 py-2 sm:w-[120px]"
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
            className="w-full px-3 py-2 sm:w-[200px]"
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
            className="w-full px-3 py-2 sm:w-[200px]"
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
            className="w-full px-3 py-2 sm:w-[200px]"
            type="text"
            placeholder="e.g. DS-2CD2143G2-I"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {category === "Curtains" && (
        <CurtainTypesEditor
          curtainTypes={curtainTypes}
          setCurtainTypes={setCurtainTypes}
          disabled={isSubmitting}
        />
      )}

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
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "UPDATE"
        )}
      </button>
    </form>
  );
};

export default Edit;
