import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Welcome to Our Store</h2>
        <div className="mt-4">
          <Link to="/clothing" className="block bg-blue-500 text-white font-bold p-2 mt-4 rounded-md hover:bg-blue-600 text-center">
            Go to Clothing Section
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;