import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-[4%] py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img className="w-[max(10%,80px)]" src={assets.logo} alt="Kaboz" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
          <p className="text-[11px] text-slate-400">Kaboz store management</p>
        </div>
      </div>
      <button
        onClick={() => setToken("")}
        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-5 sm:text-sm"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
