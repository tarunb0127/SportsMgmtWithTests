import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const API_URL = "http://localhost:4000/users";
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success or danger

  const validate = () => {
    let newErrors = {};
    if (!formData.username && !isLogin) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLogin) {
      const res = await fetch(`${API_URL}?email=${formData.email}&password=${formData.password}`);
      const data = await res.json();
      if (data.length > 0) {
        const user = data[0];
        setMessageType("success");
        setMessage(`Welcome back, ${user.username}!`);

        if (user.role === "admin") {
          navigate("/equipments");
        } else {
          navigate("/orders");
        }
      } else {
        setMessageType("danger");
        setMessage("Invalid email or password.");
      }
    } else {
      const checkRes = await fetch(`${API_URL}?email=${formData.email}`);
      const existingUser = await checkRes.json();
      if (existingUser.length > 0) {
        setMessageType("danger");
        setMessage("Email already registered.");
        return;
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessageType("success");
        setMessage(`Account created for ${formData.username}`);
        setIsLogin(true);
      } else {
        setMessageType("danger");
        setMessage("Error creating account.");
      }
    }

    setFormData({ username: "", email: "", password: "", role: "user" });
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ minWidth: "320px", maxWidth: "400px", width: "100%" }}>
        <h2 className="mb-4 text-center">{isLogin ? "Login" : "Register"}</h2>

        {message && (
          <div className={`alert alert-${messageType} text-center`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setMessage("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
