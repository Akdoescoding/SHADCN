import React, { useEffect, useState } from "react";

const Inventory = ({ userRole }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const updateStock = async (id, newStock) => {
    const token = localStorage.getItem("token");
    if (!token || userRole !== "admin") return alert("Unauthorized");

    await fetch(`http://127.0.0.1:5001/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stock: newStock }),
    });

    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      {products.map((product) => (
        <div key={product.id} className="border p-4 mb-2 rounded">
          <p>{product.name} - Stock: {product.stock}</p>
          {userRole === "admin" && (
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={() => updateStock(product.id, product.stock + 1)}
            >
              Increase Stock
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Inventory;
