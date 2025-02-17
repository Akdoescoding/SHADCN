import React, { useState } from "react";

const StockModal = ({ isOpen, onClose, product, onUpdateStock }) => {
  const [stockChange, setStockChange] = useState(0);

  if (!isOpen) return null;

  const handleUpdateStock = () => {
    const newStock = product.stock + parseInt(stockChange, 10);
    if (newStock >= 0) {
      onUpdateStock(product.id, newStock);
    } else {
      alert("Stock cannot be negative.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Update Stock for {product.name}</h2>
        <p>Current Stock: {product.stock}</p>
        <div className="mt-4">
          <label className="block text-gray-700">Change Stock By:</label>
          <input
            type="number"
            value={stockChange}
            onChange={(e) => setStockChange(e.target.value)}
            className="w-full p-2 border rounded mt-2"
          />
        </div>
        <div className="flex space-x-4 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleUpdateStock}
          >
            Apply
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;