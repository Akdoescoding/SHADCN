import "./index.css";
import React, { useState, useEffect } from "react";
import Register from "./components/ui/Register";
import Login from "./components/ui/Login";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import ProductCard from "./components/ui/ProductCard";
import Inventory from "./components/ui/Inventory";
import StockModal from "./components/ui/StockModal";
import ProductDetailsModal from "./components/ui/ProductDetailsModal"; // Ensure this import is correct

const API_URL = "http://127.0.0.1:5001"; // Centralized API URL

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

  // Dropdown States
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState("");

  // Fetch Product & Persist Authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/product`, { 
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Initially, all products are displayed
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Products Based on Dropdown Selections
  useEffect(() => {
    let filtered = [...products];

    // Apply Sorting
    if (selectedSort === "asc") {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (selectedSort === "desc") {
      filtered.sort((a, b) => b.stock - a.stock);
    }

    // Filter by Supplier
    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter(prod => selectedSuppliers.includes(prod.supplier));
    }

    // Filter by Availability
    if (selectedAvailability === "in_stock") {
      filtered = filtered.filter(prod => prod.stock > 0);
    } else if (selectedAvailability === "out_of_stock") {
      filtered = filtered.filter(prod => prod.stock === 0);
    }

    setFilteredProducts(filtered);
  }, [selectedSort, selectedSuppliers, selectedAvailability, products]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (error) {
      alert("Error logging out.");
    }
  };

  // Handle Stock Update
  const handleUpdateStock = async (productId, newStock) => {
    try {
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const openStockModal = (productId) => {
    const product = products.find(prod => prod.id === productId);
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const openDetailsModal = (productId) => {
    const product = products.find(prod => prod.id === productId);
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const closeStockModal = () => {
    setSelectedProduct(null);
    setIsStockModalOpen(false);
  };

  const closeDetailsModal = () => {
    setSelectedProduct(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthenticated ? (
        isRegistering ? (
          <Register onRegister={() => setIsRegistering(false)} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} />
        )
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Navbar */}
          <Navbar onLogout={handleLogout} />

          {/* Layout: Sidebar + Main Content */}
          <div className="flex">
            {/* Sidebar with Dropdowns */}
            <Sidebar 
              setSortOrder={setSelectedSort} 
              setFilterBySupplier={setSelectedSuppliers} 
              setFilterByAvailability={setSelectedAvailability} 
            />

            {/* Main Content Area */}
            <div className="flex-grow p-6 mt-40 bg-white-800 rounded-lg ml-64">
              {userRole === "admin" ? (
                <Inventory userRole={userRole} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
                  {loading ? (
                    <p className="text-center text-gray-400">Loading products...</p>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        id={prod.id}
                        image={`${API_URL}/assets/${prod.image}`} // Ensure correct image path
                        supplier={prod.supplier}
                        name={prod.name}
                        price={prod.price}
                        stock={prod.stock}
                        onUpdate={openStockModal} // Open stock modal on update
                        onViewDetails={openDetailsModal} // Open details modal on view details
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No products available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedProduct && (
        <StockModal
          isOpen={isStockModalOpen}
          onClose={closeStockModal}
          product={selectedProduct}
          onUpdateStock={handleUpdateStock}
        />
      )}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default App;