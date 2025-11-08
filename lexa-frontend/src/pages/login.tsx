import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("lexaUser");
    if (storedUser) {
      const { email: storedEmail, password: storedPassword } = JSON.parse(storedUser);
      if (email === storedEmail && password === storedPassword) {
        localStorage.setItem("isAuthenticated", "true");
        navigate("/app");
      } else {
        setError("Invalid email or password");
      }
    } else {
      setError("No user found. Please sign up first.");
    }
  };

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card p-5 rounded-4 text-light shadow-lg">
        <h2 className="text-center mb-4 fw-bold text-info">Lexa AI Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-transparent text-light border-info"
              id="loginEmail"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="loginEmail" className="text-secondary">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control bg-transparent text-light border-info"
              id="loginPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="loginPassword" className="text-secondary">
              Password
            </label>
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {error && <div className="text-danger small mb-3">{error}</div>}

          {/* Buttons */}
          <button className="btn btn-info w-100 py-2 fw-semibold mb-3" type="submit">
            Login
          </button>

          <p className="text-center text-secondary">
            Don’t have an account?{" "}
            <span
              className="text-info fw-semibold pointer"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
