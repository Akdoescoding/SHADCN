import React, { useState } from "react";

const AddProductModal = ({ isOpen, onClose, onInsertProduct, userRole }) => {
  // Render only if modal is open and the user is an admin
  if (!isOpen || userRole?.toLowerCase() !== "admin") return null;

  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      name,
      supplier,
      price: parseFloat(price),
      stock: parseInt(stock),
    };
    onInsertProduct(productData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Supplier:</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Price:</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Stock:</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;