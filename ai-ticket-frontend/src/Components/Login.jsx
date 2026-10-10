import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ simple validation
    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        // ✅ store token + role
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        setRole(data.role);

        alert("Login successful ✅");

        // ✅ redirect based on role
        if (data.role === "admin") {
          navigate("/");
        } else {
          navigate("/tickets");
        }

      } else {
        alert(data.message || "Invalid credentials ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">

      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-500 text-white w-full py-2 rounded">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;