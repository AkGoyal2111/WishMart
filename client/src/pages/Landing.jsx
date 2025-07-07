import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-100 px-6 text-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-6">Welcome to WishMart</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Discover affordable products near you or online — smart, fast, and personalized for you.
      </p>
      <Link to="/chat">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all text-lg">
          LOOK FOR AFFORDABLE PRODUCTS
        </button>
      </Link>
    </div>
  );
}
