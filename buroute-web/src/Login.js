import React, { useState } from "react";
import "./login_signup_style.css"; // Import your CSS file

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Remember Me:", rememberMe);
  };

  return (
    <div className="wrapper_entrance">
      <a href="/login" className="top-link" id="link1">
        Sign In
      </a>
      <a href="/signup" className="top-link" id="link2">
        Sign Up
      </a>

      <div className="container_center">
        <h2>Sign In
        <img
            src="https://github-production-user-asset-6210df.s3.amazonaws.com/110239708/313003831-cfe28590-0739-4c58-8740-45e27c0a443b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240426%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240426T123041Z&X-Amz-Expires=300&X-Amz-Signature=517974e24142cccb1dbec1a67a4794ff0c9ccc909d0b8ac02621911a7fa34786&X-Amz-SignedHeaders=host&actor_id=75087023&key_id=0&repo_id=756524338"
            alt="logo"
            className="logo"
          />
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="remember-forget-container">
            <input
              type="checkbox"
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Remember me</label>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" id="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;