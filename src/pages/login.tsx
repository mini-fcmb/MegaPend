import { Link } from "react-router-dom";
import "../index.css"; // Make sure this points correctly to your CSS file

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>

        <form>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>

          <button type="submit" className="btn">
            Log In
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
