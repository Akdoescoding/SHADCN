import React from "react";

const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Product Details</h2>
        <img src={`http://127.0.0.1:5001/assets/${product.image}`} alt={product.name} className="w-full h-64 object-cover rounded-lg mb-4" />
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>Supplier:</strong> {product.supplier}</p>
        <p><strong>Price:</strong> £{product.price}</p>
        <p><strong>Current Stock:</strong> {product.stock}</p>
        <button
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsModal;