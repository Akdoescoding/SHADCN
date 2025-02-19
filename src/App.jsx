import "./index.css";
import React, { useState, useEffect } from "react";
import Register from "./components/ui/Register";
import Login from "./components/ui/Login";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import ProductCard from "./components/ui/ProductCard";
import StockModal from "./components/ui/StockModal";
import ProductDetailsModal from "./components/ui/ProductDetailsModal";

const API_URL = "http://127.0.0.1:5001";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filters
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState("");

  // On mount, check localStorage for token & role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      console.log("User Role:", storedRole);
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // GET /product is not admin-protected, so no need for token
      const response = await fetch(`${API_URL}/product`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  // Filter whenever sort/suppliers/availability changes
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

  // Logout
  const handleLogout = async () => {
    try {
      // Not protected, so no token needed
      await fetch(`${API_URL}/logout`, { method: "POST" });
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

  // Actual PUT request to update stock (admin only)
  const handleUpdateStock = async (productId, newStock) => {
    if (userRole?.toLowerCase() !== "admin") {
      alert("Only admin users can update stock.");
      return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found, please login again.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Bearer token
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        setFilteredProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
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

  // Open the "Update Stock" modal
  const openStockModal = (productId) => {
    console.log("openStockModal called with productId:", productId);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      alert(`No product found with ID ${productId}`);
      return;
    }

    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  // Open the "View Details" modal
  const openDetailsModal = (productId) => {
    console.log("openDetailsModal called with productId:", productId);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      alert(`No product found with ID ${productId}`);
      return;
    }

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

  // Called after a successful login
  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    console.log("Logged in as:", role);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthenticated ? (
        isRegistering ? (
          <Register switchToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLogin={handleLogin} switchToRegister={() => setIsRegistering(true)} />
        )
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar onLogout={handleLogout} />

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
                      userRole={userRole}
                      onViewDetails={openDetailsModal}
                      onUpdate={openStockModal}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-400">No products available.</p>
                )}
              </div>
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
