import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login.tsx";
import SignupPage from "./pages/signup.tsx";
import ChatApp from "./AppChat.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import DescriptionPage from "./pages/description.tsx"; // 👈 import description
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const isLoggedIn = () => {
  const user = localStorage.getItem("lexaUser");
  return !!user;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default route now goes to DescriptionPage */}
        <Route path="/" element={<DescriptionPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Chat route (protected) */}
        <Route
          path="/app"
          element={<ProtectedRoute element={<ChatApp />} />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn() ? "/app" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
