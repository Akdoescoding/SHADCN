import "./index.css";
import React, { useState, useEffect } from "react";
import Register from "./components/ui/Register";
import Login from "./components/ui/Login";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import ProductCard from "./components/ui/ProductCard";
import Inventory from "./components/ui/Inventory";

const API_URL = "http://127.0.0.1:5001"; // ✅ Centralized API URL

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [product, setProduct] = useState([]); // ✅ Ensure correct state naming
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Product & Persist Authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }

    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      console.log("🚀 fetchProduct() is running");

      const response = await fetch(`${API_URL}/product`, {  // ✅ FIXED
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Failed to fetch product");
  
      const data = await response.json();
      console.log("✅ Fetched product:", data);
      setProduct(data);
    } catch (error) {
      console.error("❌ Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ Handle Login
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
        setUserRole(data.role);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        fetchProduct(); // ✅ Fetch latest product after login
      } else {
        alert("❌ Login failed: " + data.message);
      }
    } catch (error) {
      alert("❌ Error connecting to the server.");
    }
  };

  // ✅ Handle Registration
  const handleRegister = async (username, password, role = "user") => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Registration successful! Please log in.");
        setIsRegistering(false);
      } else {
        alert("❌ Registration failed: " + data.message);
      }
    } catch (error) {
      alert("❌ Error connecting to the server.");
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (error) {
      alert("❌ Error logging out.");
    }
  };

  // ✅ Handle Stock Update (Admin Only)
  const handleUpdateStock = async (productId) => {
    if (userRole !== "admin") {
      alert("❌ Unauthorized! Only admins can update stock.");
      return;
    }

    const newStock = prompt("Enter new stock quantity:");
    if (newStock === null || isNaN(newStock) || parseInt(newStock) < 0) {
      alert("❌ Invalid stock value. Please enter a valid number.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stock: parseInt(newStock) }),
      });

      if (response.ok) {
        setProduct((prevProduct) =>
          prevProduct.map((prod) =>
            prod.id === productId ? { ...prod, stock: parseInt(newStock) } : prod
          )
        );
        alert("✅ Stock updated successfully!");
      } else {
        alert("❌ Failed to update stock.");
      }
    } catch (error) {
      console.error("❌ Error updating stock:", error);
      alert("❌ Error updating stock.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthenticated ? (
        isRegistering ? (
          <Register onRegister={handleRegister} switchToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLogin={handleLogin} switchToRegister={() => setIsRegistering(true)} />
        )
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* ✅ Navbar */}
          <Navbar onLogout={handleLogout} />

          {/* ✅ Layout: Sidebar + Main Content */}
          <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-grow p-6 mt-16 bg-white-800 rounded-lg">
              {userRole === "admin" ? (
                <Inventory userRole={userRole} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading ? (
                    <p className="text-center text-gray-400">Loading product...</p>
                  ) : product.length > 0 ? (
                    product.map((prod) => {
                      console.log("🔹 Rendering product:", prod);
                      return (
                        <ProductCard
                          key={prod.id}
                          id={prod.id}
                          image={`${API_URL}/static/${prod.image}`} // ✅ Fix Image Path
                          supplier={prod.supplier}
                          name={prod.name}
                          price={prod.price}
                          stock={prod.stock}
                          onUpdate={handleUpdateStock} // ✅ Pass update function
                        />
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-400">No product available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
