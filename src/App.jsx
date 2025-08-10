import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import EquipmentForm from "./Components/EquipmentForm";
// import UserForm from "./components/UserForm";
import OrderForm from "./Components/OrderForm";

export default function App() {
  return (
    <Router>
      <div>
        {/* Bootstrap Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <NavLink className="navbar-brand fw-bold" to="/">
              Sports Management App
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-semibold" : ""}`
                    }
                    end
                  >
                    Equipment
                  </NavLink>
                </li>
            
                <li className="nav-item">
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active fw-semibold" : ""}`
                    }
                  >
                    Orders
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<EquipmentForm />} />
            <Route path="/orders" element={<OrderForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
