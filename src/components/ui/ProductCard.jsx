import React, { useEffect, useState } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/products") // URL of your JSON server
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {products.map((product) => (
        <div key={product.id} style={{ border: "1px solid #ddd", padding: "10px" }}>
          <img
            src={`/assets/${product.image}`}  // Ensure this path matches your assets folder
            alt={product.name}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
          <h3>{product.name}</h3>
          <p>Supplier: {product.supplier}</p>
          <p>Price: £{product.price}</p>
          <p style={{ color: product.stock < 5 ? "red" : "green" }}>
            {product.stock < 5 ? "Low Stock" : "High Stock"}
          </p>
          <button>Update Stock</button>
          <button>View Details</button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
