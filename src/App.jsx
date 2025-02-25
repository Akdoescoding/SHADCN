import "./index.css";
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Register from "./components/ui/Register";
import Login from "./components/ui/Login";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import ProductCard from "./components/ui/ProductCard";
import Inventory from "./components/ui/Inventory";
import StockModal from "./components/ui/StockModal";
import ProductDetailsModal from "./components/ui/ProductDetailsModal";
import Home from "./components/ui/Home";
// Modal for inserting a new product (only admin users)
import AddProductModal from "./components/ui/AddProductModal";

const API_URL = "http://127.0.0.1:5001";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // New state for add product modal (insertion)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Dropdown States
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      console.log("User Role from storage:", storedRole);
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/product`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      console.log("✅ Products fetched successfully:", data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on dropdown selections
  useEffect(() => {
    let filtered = [...products];

    if (selectedSort === "asc") {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (selectedSort === "desc") {
      filtered.sort((a, b) => b.stock - a.stock);
    }

    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter((prod) =>
        selectedSuppliers.includes(prod.supplier)
      );
    }

    if (selectedAvailability === "in_stock") {
      filtered = filtered.filter((prod) => prod.stock > 0);
    } else if (selectedAvailability === "out_of_stock") {
      filtered = filtered.filter((prod) => prod.stock === 0);
    }

    setFilteredProducts(filtered);
    console.log("Filtered Products:", filtered);
  }, [selectedSort, selectedSuppliers, selectedAvailability, products]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setIsAuthenticated(false);
      setUserRole(null);
      setProducts([]);
      setFilteredProducts([]);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (error) {
      alert("Error logging out.");
    }
  };

  // Update product stock (only admin)
  const handleUpdateStock = async (productId, newStock) => {
    if (userRole?.toLowerCase() !== "admin") {
      alert("Only admin users can update stock.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ stock: newStock }),
      });
      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.map((prod) =>
            prod.id === productId ? { ...prod, stock: newStock } : prod
          )
        );
        setFilteredProducts((prevProducts) =>
          prevProducts.map((prod) =>
            prod.id === productId ? { ...prod, stock: newStock } : prod
          )
        );
        alert("Stock updated successfully!");
      } else {
        alert("Failed to update stock.");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock.");
    }
  };

  // Insert a new product (only admin)
  const handleInsertProduct = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Attempting to insert product:", productData);
      const response = await fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        fetchProducts();
        alert("Product inserted successfully!");
      } else {
        const errorText = await response.text();
        alert(`Failed to insert product: ${errorText}`);
        console.error("Insert error:", errorText);
      }
    } catch (error) {
      console.error("Error inserting product:", error);
      alert("Error inserting product.");
    }
  };

  // Delete a product (only admin)
  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (response.ok) {
        fetchProducts();
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product.");
    }
  };

  // Open modals
  const openStockModal = (productId) => {
    const product = products.find((prod) => prod.id === productId);
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const openDetailsModal = (productId) => {
    const product = products.find((prod) => prod.id === productId);
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  // Close modals
  const closeStockModal = () => {
    setSelectedProduct(null);
    setIsStockModalOpen(false);
  };

  const closeDetailsModal = () => {
    setSelectedProduct(null);
    setIsDetailsModalOpen(false);
  };

  // Controls for add product modal (insertion)
  const openAddProductModal = () => {
    setIsAddProductModalOpen(true);
  };

  const closeAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };

  // Called by the Login component after a successful login.
  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    console.log("Logged in as:", role);
  };

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        isRegistering ? (
          <Register switchToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLogin={handleLogin} switchToRegister={() => setIsRegistering(true)} />
        )
      ) : (
        <div className="flex flex-col min-h-screen bg-white text-black">
          <Navbar onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/clothing"
              element={
                <div className="flex">
                  <Sidebar
                    setSortOrder={setSelectedSort}
                    setFilterBySupplier={setSelectedSuppliers}
                    setFilterByAvailability={setSelectedAvailability}
                  />
                  <div className="flex-grow p-6 mt-40 bg-white-800 rounded-lg ml-64">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
                      {loading ? (
                        <p className="text-center text-gray-400">Loading products...</p>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            id={prod.id}
                            image={`${API_URL}/assets/${prod.image}`}
                            supplier={prod.supplier}
                            name={prod.name}
                            price={prod.price}
                            stock={prod.stock}
                            // For admin, pass the callback; for non-admin, pass undefined
                            onViewDetails={
                              userRole?.toLowerCase() === "admin"
                                ? openDetailsModal
                                : undefined
                            }
                            onUpdate={
                              userRole?.toLowerCase() === "admin"
                                ? openStockModal
                                : undefined
                            }
                            onDelete={
                              userRole?.toLowerCase() === "admin"
                                ? () => handleDeleteProduct(prod.id)
                                : undefined
                            }
                            userRole={userRole}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-400">No products available.</p>
                      )}
                    </div>

                    {/* 
                      "Add Product" button at the bottom,
                      visible ONLY if userRole is admin.
                    */}
                    {userRole?.toLowerCase() === "admin" && (
                      <button
                        onClick={openAddProductModal}
                        className="mt-8 px-4 py-2 bg-green-500 text-white rounded"
                      >
                        Add Product
                      </button>
                    )}
                  </div>
                </div>
              }
            />
            <Route
              path="/other-category"
              element={
                <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)]">
                  <h1 className="text-4xl font-bold text-gray-500">Loading products...</h1>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      )}

      {/* Stock Modal */}
      {selectedProduct && (
        <StockModal
          isOpen={isStockModalOpen}
          onClose={closeStockModal}
          product={selectedProduct}
          onUpdateStock={handleUpdateStock}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          product={selectedProduct}
        />
      )}

      {/* Add Product Modal (Admin Only) */}
      {isAddProductModalOpen && (
        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={closeAddProductModal}
          onInsertProduct={handleInsertProduct}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default App;
