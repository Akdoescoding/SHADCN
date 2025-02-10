import React from "react";

const ProductCard = ({ id, image, supplier, name, price, stock, onDelete, onUpdate }) => {
  const userRole = localStorage.getItem("role"); // Retrieve role from localStorage

  // Determine stock status
  const stockStatus = stock < 10 ? "Low Stock" : "High Stock";
  const stockColor = stock < 10 ? "text-red-500" : "text-green-500";

  // Dynamically load image from src/assets
  let imagePath;
  try {
    imagePath = require(`../../assets/${image}`);
  } catch (error) {
    imagePath = require("../../assets/placeholder.png"); // Fallback image
  }

  return (
    <div className="border border-gray-300 rounded-lg shadow-lg p-4 bg-white">
      {/* Product Image */}
      <div className="w-full flex justify-center mb-3">
        <img
          src={imagePath}
          alt={name}
          className="w-full h-[250px] object-contain rounded-lg"
        />
      </div>

      {/* Product Details */}
      <h2 className="text-lg font-extrabold">{supplier}</h2>
      <p className="text-gray-600">{name}</p>

      {/* Price and Stock Status */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-lg font-semibold">£{price}</p>
        <p className={`text-lg font-bold ${stockColor}`}>{stockStatus}</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4 gap-2">
        {/* Update Stock Button (Only for Admins) */}
        {userRole === "admin" && (
          <button
            onClick={() => onUpdate(id)}
            className="bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 w-full"
          >
            Update Stock
          </button>
        )}

        {/* View Details Button */}
        <button className="bg-gray-900 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 w-full">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
