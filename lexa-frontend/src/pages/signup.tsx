import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    localStorage.setItem("lexaUser", JSON.stringify({ name, email, password }));
    setError("");
    alert("Signup successful! You can now log in.");
    navigate("/");
  };

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card p-5 rounded-4 text-light shadow-lg">
        <h2 className="text-center mb-4 fw-bold text-info">Create Your Lexa Account</h2>

        <form onSubmit={handleSignup}>
          {/* Name */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent text-light border-info"
              id="signupName"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="signupName" className="text-secondary">
              Full Name
            </label>
          </div>

          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-transparent text-light border-info"
              id="signupEmail"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="signupEmail" className="text-secondary">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control bg-transparent text-light border-info"
              id="signupPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="signupPassword" className="text-secondary">
              Password
            </label>
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {error && <div className="text-danger small mb-3">{error}</div>}

          <button className="btn btn-info w-100 py-2 fw-semibold mb-3" type="submit">
            Sign Up
          </button>

          <p className="text-center text-secondary">
            Already have an account?{" "}
            <span
              className="text-info fw-semibold pointer"
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
