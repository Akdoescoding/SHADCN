import React from "react";

const ProductCard = ({
  id,
  image,
  supplier,
  name,
  price,
  stock,
  onUpdate,
  onViewDetails,
  onDelete,
  userRole
}) => {
  return (
    <div className="border rounded p-4 shadow">
      {/* Render image only if the user is not an admin */}
      {userRole?.toLowerCase() !== "admin" && (
        <img src={image} alt={name} className="w-full h-40 object-cover mb-4" />
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p>Supplier: {supplier}</p>
      <p>Price: ${price}</p>
      <p>Stock: {stock}</p>

      {/* Only show these buttons if the user is admin */}
      {userRole?.toLowerCase() === "admin" && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onViewDetails(id)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            View Details
          </button>
          <button
            onClick={() => onUpdate(id)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Update Stock
          </button>
          <button
            onClick={() => onDelete(id)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
