// src/components/ui/Register.jsx
import React, { useState } from "react";

const Register = ({ switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default "user"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("✅ Registration successful! Please login.");
        switchToLogin();
      } else {
        setError(data.message || "❌ Registration failed.");
      }
    } catch (err) {
      setError("❌ Error connecting to server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-bold mb-8">WMG Invent</h1>

      <div className="bg-black text-white w-80 p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Register</h2>

        <form onSubmit={handleRegister}>
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
          <div className="mb-4">
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
          <div className="mb-6">
            <select
              className="w-full px-4 py-2 border border-gray-400 rounded bg-black text-white 
                         focus:outline-none focus:border-gray-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="font-bold cursor-pointer text-blue-400 hover:underline"
            onClick={switchToLogin}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
