import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route,  } from "react-router-dom";

import Add from "./pages/Add";
import List from "./pages/List";
import Edit from "./pages/Edit";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Blogs from "./pages/Blogs";
import Services from "./pages/Services";
import Homepage from "./pages/Homepage";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = 'AED'

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer position="top-right" theme="colored" />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div className="flex w-full">
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 py-6 text-slate-600 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/edit/:id" element={<Edit token={token} />} />
                <Route path="/categories" element={<Categories token={token} />} />
                <Route path="/homepage" element={<Homepage token={token} />} />
                <Route path="/services" element={<Services token={token} />} />
                <Route path="/blogs" element={<Blogs token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;