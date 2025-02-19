import React, { useState } from "react";

function Login({ onLogin, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    if (onLogin) {
      onLogin("admin"); // or "user"
    }
  };

  return (
  
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      {/* Top heading */}
      <h1 className="text-5xl font-bold mb-8">WMG Invent</h1>

      {/* Black login box with white text */}
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
