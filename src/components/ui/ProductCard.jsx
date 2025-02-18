import React from "react";

const ProductCard = ({ id, name, supplier, price, stock, onUpdate, onViewDetails }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-72">
      {/* Product Details */}
      <div className="mt-4">
        <h2 className="text-black font-bold uppercase">{supplier}</h2>
        <p className="text-gray-700 text-lg">{name}</p>
        <p className="text-black font-semibold text-xl">£{price}</p>

        {/* Stock Status */}
        <p className={`mt-2 text-md font-semibold ${stock < 5 ? "text-red-500" : "text-green-600"}`}>
          {stock < 5 ? "Low Stock" : "In Stock"}
        </p>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button 
            onClick={() => onUpdate(id)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            Update Stock
          </button>
          <button 
            onClick={() => onViewDetails(id)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;