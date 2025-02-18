import React, { useState } from "react";

const Register = ({ switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role: "user"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }), // Include role
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mt-4 border border-gray-400 rounded-md focus:outline-none focus:border-gray-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mt-4 border border-gray-400 rounded-md focus:outline-none focus:border-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role Selection Dropdown */}
          <select
            className="w-full p-2 mt-4 border border-gray-400 rounded-md focus:outline-none focus:border-gray-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold p-2 mt-4 rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span className="font-bold cursor-pointer text-blue-500 hover:underline" onClick={switchToLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;