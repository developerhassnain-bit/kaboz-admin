import React from "react";
import { assets } from "../assets/assets";

const Maintenance = () => {
  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-center px-4 text-center">

      {/* Logo */}
      <img
        src={assets.logo}
        alt="Kaboz"
        className="w-40 mb-10"
      />

      {/* Website Down Icon */}
      <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 11-12.728 12.728A9 9 0 0118.364 5.636z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.5 8.5l7 7"
          />
        </svg>
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-3">
        Website Temporarily Unavailable
      </h1>

      <p className="text-gray-500 text-sm sm:text-base max-w-md leading-relaxed mb-8">
        Our website is currently down and unavailable.
      </p>

      {/* Try Again */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-8 py-3 rounded-lg transition-colors"
      >
        Try Again
      </button>

    </div>
  );
};

export default Maintenance;