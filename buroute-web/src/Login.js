import React, { useState } from "react";
import "./login_signup_style.css"; 
import {useAuth} from "./hooks/AuthProvider"

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null); // State for storing error messages

  const auth = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://127.0.0.1:8000/database_search/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setError(null);
        auth.login(data); 
        window.location.href = '/search';
      }
      else {
        // Display error message if login failed
        setError(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };
  

  return (
    <div className="wrapper_entrance">
    <div className="container_center">
      <h2>Sign In
        <img
          src="/logo.jpg" // Replace with your logo URL
          alt="logo"
          className="logo"
        />
      </h2>
      <div className="error-message">
        {error && <p>{error}</p>}
      </div>
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
          <div>
            <input
              type="checkbox"
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Remember me</label>
          </div>
          <a href="/forgot" className="forgot-password">Forgot password?</a>
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="signup-redirect">
        Don't have an account? <a href="/signup">Sign up now</a>
      </div>
    </div>
  </div>  
  );
};

export default Login;
