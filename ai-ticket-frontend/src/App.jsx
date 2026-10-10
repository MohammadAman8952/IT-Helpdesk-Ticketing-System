import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import CreateTicket from "./Components/CreateTicket";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./Components/Login";
import Register from "./Components/Register";

function App() {
  // ✅ FIX: get role from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || "user");

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <Navbar setRole={setRole} />

      <div className="flex-grow overflow-auto">
        <Routes>

          {/* ✅ Admin Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute role={role} allowedRole="admin">
                <Dashboard role={role} />
              </ProtectedRoute>
            }
          />

          {/* ✅ User Route */}
          <Route
            path="/tickets"
            element={<Dashboard role={role} />}
          />

          {/* Create Ticket */}
          <Route path="/create" element={<CreateTicket />} />

          {/* Auth */}
          <Route path="/login" element={<Login setRole={setRole} />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;