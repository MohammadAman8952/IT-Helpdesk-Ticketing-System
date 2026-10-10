import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ setRole }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔥 update token when storage changes
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);        // ✅ update UI instantly
    setRole("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">

      {/* Logo */}
      <h1 className="text-xl font-bold">Helpdesk AI</h1>

      {/* Links */}
      <div className="flex space-x-6">
        <Link to="/">Home</Link>
        <Link to="/tickets">Tickets</Link>
        <Link to="/create">Create</Link>
      </div>

      {/* Auth Buttons */}
      <div className="space-x-3">

        {!token ? (
          <>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-3 py-1 rounded"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;