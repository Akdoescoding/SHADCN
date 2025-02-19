// src/components/ui/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    if (category === "Clothing") {
      // Navigate to your Clothing Inventory Management page
      navigate("/clothing");
    } else {
      // Navigate to a page showing "Loading products..." for all other categories
      navigate("/other-category");
    }
  };

  return (
    <div
      className="
        flex
        flex-col
        justify-center
        min-h-[calc(100vh-80px)]
        ml-80
        text-center
        px-4
      "
    >
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-4">Welcome to WMG Invent!</h1>
      <p className="text-gray-600 mb-9">Select a category to get started:</p>

      {/* Category Grid */}
      <div className="flex flex-wrap gap-8 justify-center">
        {/* Books */}
        <div
          onClick={() => handleCategoryClick("Books")}
          className="cursor-pointer w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg">Books</p>
        </div>

        {/* Grocery */}
        <div
          onClick={() => handleCategoryClick("Grocery")}
          className="cursor-pointer w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg">Grocery</p>
        </div>

        {/* Electronics */}
        <div
          onClick={() => handleCategoryClick("Electronics")}
          className="cursor-pointer w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg">Electronics</p>
        </div>

        {/* Clothing */}
        <div
          onClick={() => handleCategoryClick("Clothing")}
          className="cursor-pointer w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg">Clothing</p>
        </div>

        {/* Healthcare */}
        <div
          onClick={() => handleCategoryClick("Healthcare")}
          className="cursor-pointer w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg">Healthcare</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
