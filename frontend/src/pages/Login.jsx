
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Invalid Email or Password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">🛡️</div>
          <span className="auth-logo-text">
            ChurnGuard AI
          </span>
        </div>

        <h1 className="auth-heading">
          Welcome Back
        </h1>

        <p className="auth-sub">
          Sign in to continue
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="field-wrap">

            <label className="field-label">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              className="cg-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="field-wrap">

            <label className="field-label">
              Password
            </label>

            <input
              type="password"
              name="password"
              className="cg-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create One
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;
