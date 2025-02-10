import "./index.css";
import React, { useState, useEffect } from "react";
import Register from "./components/ui/Register";
import Login from "./components/ui/Login";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import ProductCard from "./components/ui/ProductCard";
import Inventory from "./components/ui/Inventory";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [products, setProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // ✅ Fetch Products & Persist Authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }

    // Fetch products from API
    fetch("http://127.0.0.1:5001/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data);  // Debugging log
        setProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // ✅ Handle Login
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://127.0.0.1:5001/login", {
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
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      alert("Error connecting to the server.");
    }
  };

  // ✅ Handle Registration
  const handleRegister = async (username, password, role = "user") => {
    try {
      const response = await fetch("http://127.0.0.1:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        setIsRegistering(false);
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (error) {
      alert("Error connecting to the server.");
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:5001/logout", { method: "POST", credentials: "include" });
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (error) {
      alert("Error logging out.");
    }
  };

  // ✅ Handle Stock Update
  const handleUpdateStock = async (productId, newStock) => {
    const token = localStorage.getItem("token");
    if (!token || userRole !== "admin") {
      return alert("Unauthorized");
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId ? { ...product, stock: newStock } : product
          )
        );
      } else {
        alert("Failed to update stock.");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock.");
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
                  {products.length > 0 ? (
                    products.map((product) => {
                      console.log("Rendering product:", product);  // Debugging log
                      return (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          image={product.image}
                          supplier={product.supplier}  // ✅ Supplier instead of brand
                          name={product.name}
                          price={product.price}
                          stock={product.stock}  // ✅ Correctly pass stock
                          onUpdate={handleUpdateStock}
                        />
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-400">Loading products...</p>
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
