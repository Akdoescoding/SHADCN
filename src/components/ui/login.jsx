import React, { useState } from "react";

function Login({ onLogin, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(username, password);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side (Login Form) */}
      <div className="w-1/3 flex items-center justify-center bg-white">
        <div className="w-80 p-8">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded"
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
              className="text-blue-500 hover:underline cursor-pointer font-bold"
              onClick={switchToRegister}
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* Right side (Black background, WMG Invent text) */}
      <div className="flex-grow bg-black flex items-center justify-center">
        <h1 className="text-5xl font-bold text-white">WMG Invent</h1>
      </div>
    </div>
  );
}

export default Login;
