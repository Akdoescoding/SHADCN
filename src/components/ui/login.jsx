import React, { useState } from "react";

const Login = ({ onLogin, switchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await onLogin(username, password);
    } catch (err) {
      setError("❌ Invalid username or password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Login</h2>

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

        <button
          className="w-full bg-blue-500 text-white font-bold p-2 mt-4 rounded-md hover:bg-blue-600"
          onClick={handleLogin}
        >
          Login
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* ✅ Add Register Option */}
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <span
            className="font-bold cursor-pointer text-blue-500 hover:underline"
            onClick={switchToRegister}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
