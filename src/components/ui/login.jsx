// src/components/ui/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // The server returns { "access_token": "...", "refresh_token": "...", "role": "..." }
      // Store 'access_token' (NOT 'token')
      localStorage.setItem("token", data.access_token); 
      localStorage.setItem("role", data.role);

      // Optionally, store refresh_token if you plan to use it:
      // localStorage.setItem("refresh_token", data.refresh_token);

      // Update the App state
      onLogin(data.role);

      // Redirect to home
      navigate("/home", { replace: true });
    } catch (err) {
      setError("❌ Error connecting to server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-bold mb-8">WMG Invent</h1>

      <div className="bg-black text-white w-80 p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border border-gray-400 rounded bg-black text-white 
                         placeholder-gray-300 focus:outline-none focus:border-gray-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-400 rounded bg-black text-white 
                         placeholder-gray-300 focus:outline-none focus:border-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <p className="mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            className="text-blue-400 hover:underline cursor-pointer font-bold"
            onClick={switchToRegister}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
