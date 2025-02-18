import React from "react";

const ProductCard = ({ id, image, supplier, name, price, stock, onUpdate, onViewDetails, userRole }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
      <div className="mt-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-gray-600">Supplier: {supplier}</p>
        <p className="text-gray-600">Price: £{price.toFixed(2)}</p> {/* Display price in pounds */}
        <button
          className="mt-2 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
          onClick={() => onViewDetails(id)}
        >
          View Details
        </button>
        {userRole === "admin" && (
          <button
            className="mt-2 bg-green-500 text-white py-1 px-4 rounded-md hover:bg-green-600 ml-2"
            onClick={() => onUpdate(id)}
          >
            Update Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;