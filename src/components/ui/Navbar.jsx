import React from "react";
import { FaSearch, FaSignOutAlt } from "react-icons/fa"; // Import Logout Icon
import { Link } from "react-router-dom"; // Import Link from React Router

const Navbar = ({ onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0a0e1a] text-white h-[130px] flex flex-col items-center px-8 shadow-lg">
      {/* Top Section - Logo & Search Bar */}
      <div className="w-full flex justify-between items-center py-3">
        {/* Logo */}
        <h1 className="text-3xl font-bold">WMG Invent</h1>

        {/* Search Bar */}
        <div className="relative w-[60%] max-w-[1500px]">
          <input
            type="text"
            placeholder="Search for a product"
            className="w-full py-3 px-4 pr-12 rounded-full bg-white text-black focus:outline-none shadow-md"
          />
          <FaSearch className="absolute top-3 right-4 text-gray-500 text-lg" />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition"
        >
          <FaSignOutAlt className="text-lg" /> {/* Logout Icon */}
          Logout
        </button>
      </div>

      {/* Bottom Section - Categories */}
      <div className="w-full flex justify-around text-lg font-semibold py-2">
        <Link to="/electronics" className="text-white hover:text-gray-400 transition">Electronics</Link>
        <Link to="/clothes" className="text-white hover:text-gray-400 transition">Clothes</Link>
        <Link to="/health" className="text-white hover:text-gray-400 transition">Health</Link>
        <Link to="/books" className="text-white hover:text-gray-400 transition">Books</Link>
        <Link to="/grocery" className="text-white hover:text-gray-400 transition">Grocery</Link>
      </div>
    </nav>
  );
};

export default Navbar;