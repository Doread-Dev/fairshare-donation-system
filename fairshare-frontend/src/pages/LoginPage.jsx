import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { useAppContext } from "../contexts/AppContext";
import api from "../services/api";

const LoginPage = () => {
  const { login, isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.token);
      login(res.user);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${styles.body}`}
    >
      <img
        src="/Top left.svg"
        alt=""
        className="absolute top-0 left-0 z-0 opacity-90 pointer-events-none w-32 sm:w-48 md:w-64 lg:w-80 xl:w-[22rem]"
      />
      <img
        src="/Bottom Right.svg"
        alt=""
        className="absolute bottom-0 right-0 z-0 opacity-90 pointer-events-none w-32 sm:w-48 md:w-64 lg:w-80 xl:w-[22rem]"
      />

      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md z-10 border border-gray-100 mx-4 sm:mx-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 tracking-wide">
          FairShare
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-5 sm:mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-800 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5F7464] focus:bg-white transition duration-200 ${styles.placeholderColor}`}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-800 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5F7464] focus:bg-white transition duration-200 ${styles.placeholderColor}`}
            />
          </div>
          <div className="text-right mb-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-[#5F7464] transition duration-200 underline underline-offset-2"
            >
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-[#5F7464] text-white py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#4A5A4F] focus:ring-4 focus:ring-[#5F7464]/50 focus:outline-none transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
