import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const links = [
  { to: "/add", label: "Add Items", icon: assets.add_icon },
  { to: "/list", label: "Products", icon: assets.order_icon },
  { to: "/categories", label: "Categories", icon: assets.order_icon },
  { to: "/homepage", label: "Homepage", icon: assets.order_icon },
  { to: "/services", label: "Services", icon: assets.order_icon },
  { to: "/blogs", label: "Blogs", icon: assets.order_icon },
  { to: "/orders", label: "Orders", icon: assets.order_icon },
];

const Sidebar = () => {
  return (
    <aside className="min-h-[calc(100vh-64px)] w-[18%] min-w-[72px] border-r border-slate-200 bg-white">
      <div className="flex flex-col gap-2 p-3 pt-5 sm:pl-4 sm:pr-0">
        <p className="mb-1 hidden px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 md:block">
          Menu
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-l-xl border border-r-0 px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "active border-orange-300 bg-orange-50 text-orange-700"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <img className="h-5 w-5" src={link.icon} alt="" />
            <p className="hidden md:block">{link.label}</p>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
