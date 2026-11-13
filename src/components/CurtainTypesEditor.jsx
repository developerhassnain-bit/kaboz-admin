import React from "react";
import { assets } from "../assets/assets";

const CurtainTypesEditor = ({ curtainTypes, setCurtainTypes, disabled }) => {
  const addType = () => {
    setCurtainTypes((prev) => [
      ...prev,
      { name: "", thumbnailFile: null, thumbnailPreview: "", colors: [] },
    ]);
  };

  const removeType = (typeIndex) => {
    setCurtainTypes((prev) => prev.filter((_, i) => i !== typeIndex));
  };

  const updateTypeName = (typeIndex, value) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex ? { ...type, name: value } : type
      )
    );
  };

  const updateTypeThumbnail = (typeIndex, file) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex
          ? {
              ...type,
              thumbnailFile: file,
              thumbnailPreview: URL.createObjectURL(file),
            }
          : type
      )
    );
  };

  const addColor = (typeIndex) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex
          ? {
              ...type,
              colors: [
                ...type.colors,
                { code: "", imageFile: null, imagePreview: "", image: "" },
              ],
            }
          : type
      )
    );
  };

  const removeColor = (typeIndex, colorIndex) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex
          ? {
              ...type,
              colors: type.colors.filter((_, ci) => ci !== colorIndex),
            }
          : type
      )
    );
  };

  const updateColorCode = (typeIndex, colorIndex, value) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex
          ? {
              ...type,
              colors: type.colors.map((color, ci) =>
                ci === colorIndex ? { ...color, code: value } : color
              ),
            }
          : type
      )
    );
  };

  const updateColorImage = (typeIndex, colorIndex, file) => {
    setCurtainTypes((prev) =>
      prev.map((type, i) =>
        i === typeIndex
          ? {
              ...type,
              colors: type.colors.map((color, ci) =>
                ci === colorIndex
                  ? {
                      ...color,
                      imageFile: file,
                      imagePreview: URL.createObjectURL(file),
                    }
                  : color
              ),
            }
          : type
      )
    );
  };

  return (
    <div className="w-full border-t pt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-700">
          Curtain Types & Color Codes
        </p>
        <button
          type="button"
          onClick={addType}
          disabled={disabled}
          className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          + Add Type
        </button>
      </div>

      {curtainTypes.length === 0 && (
        <p className="text-xs text-gray-400 mb-2">
          No types added yet. Click "Add Type" to create one (e.g. "Classic
          Weave").
        </p>
      )}

      <div className="flex flex-col gap-4">
        {curtainTypes.map((type, typeIndex) => (
          <div
            key={typeIndex}
            className="border border-gray-300 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <label className="cursor-pointer flex-shrink-0">
                <img
                  className="w-16 h-16 object-cover rounded border border-gray-300 bg-white"
                  src={
                    type.thumbnailPreview ||
                    type.thumbnail ||
                    assets.upload_area
                  }
                  alt=""
                />
                <input
                  type="file"
                  hidden
                  disabled={disabled}
                  onChange={(e) =>
                    e.target.files[0] &&
                    updateTypeThumbnail(typeIndex, e.target.files[0])
                  }
                />
              </label>

              {/* Name + remove */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type name (e.g. Classic Weave)"
                  value={type.name}
                  onChange={(e) => updateTypeName(typeIndex, e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => removeType(typeIndex)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 text-sm px-2"
                title="Remove type"
              >
                &times; Remove
              </button>
            </div>

            {/* Colors within this type */}
            <div className="mt-4 pl-2 border-l-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">
                  Color Codes (SKU)
                </p>
                <button
                  type="button"
                  onClick={() => addColor(typeIndex)}
                  disabled={disabled}
                  className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                >
                  + Add Color
                </button>
              </div>

              {type.colors.length === 0 && (
                <p className="text-xs text-gray-400 mb-2">
                  No color codes yet.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {type.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="flex flex-col items-center gap-1 bg-white border border-gray-200 rounded-lg p-2 w-28"
                  >
                    <label className="cursor-pointer">
                      <img
                        className="w-20 h-20 object-cover rounded border border-gray-300 bg-gray-50"
                        src={
                          color.imagePreview ||
                          color.image ||
                          assets.upload_area
                        }
                        alt=""
                      />
                      <input
                        type="file"
                        hidden
                        disabled={disabled}
                        onChange={(e) =>
                          e.target.files[0] &&
                          updateColorImage(
                            typeIndex,
                            colorIndex,
                            e.target.files[0]
                          )
                        }
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="SKU / Code"
                      value={color.code}
                      disabled={disabled}
                      onChange={(e) =>
                        updateColorCode(
                          typeIndex,
                          colorIndex,
                          e.target.value
                        )
                      }
                      className="w-full px-1.5 py-1 border border-gray-300 rounded text-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(typeIndex, colorIndex)}
                      disabled={disabled}
                      className="text-red-400 hover:text-red-600 text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurtainTypesEditor;