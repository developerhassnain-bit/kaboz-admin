import React, { useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });
      if (response.data.success) {
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-orange-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
          Kaboz
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to manage products, categories, and orders.
        </p>
        <form onSubmit={onSubmitHandler} className="mt-6">
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Email address
            </p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="admin-input w-full"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium text-slate-700">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="admin-input w-full"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="admin-btn-primary mt-2 w-full py-2.5"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
