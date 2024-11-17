import React, { useState, useEffect } from "react";
import "./login_signup_style.css"; 
import { useLocation } from 'react-router-dom';

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null); // State for storing error messages
  const [successMessage, setSuccessMessage] = useState(null); // State for storing success message
  const [loading, setLoading] = useState(false); // State for controlling the loading indicator

  const location = useLocation();
  const fromPrivate = location.state?.from === 'private';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null); // Reset success message
    setLoading(true); // Show loading indicator

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'same-origin',
      });

      if (response.ok) {
        setError(null);
        const data = await response.json();
        localStorage.setItem('authToken', data['token']);
        localStorage.setItem('user_id', data['user_id']);
        localStorage.setItem('username', username);

        // Display success message
        setSuccessMessage("Login successful! Logging you in...");
        setTimeout(() => {
          window.location.href = '/feed'; // Redirect to feed after a short delay
        }, 2000);
      } else {
        const data = await response.json();
        // Display error message if login failed
        setError(data.error || 'An error occurred while logging in. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false); // Hide loading indicator regardless of success or failure
    }
  };

  return (
    <div className="wrapper_entrance"
    style={{
      background: `url('/resources/login-signup-bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      backgroundRepeat: 'no-repeat',
    }}
    >
      <div className="container_center">
        <h2>Sign In</h2>
        {/* Message for login required */}
        {fromPrivate && (
          <div className="info-message">
            <p>Please log in to continue.</p>
          </div>
        )}
        {/* Display error or success messages */}
        {error && <div className="error-message"><p>{error}</p></div>}
        {successMessage && <div className="success-message"><p>{successMessage}</p></div>}

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
          {loading ? (
            <button type="submit" className="login-button loading" disabled>Loading...</button>
          ) : (
            <button type="submit" className="login-button">Login</button>
          )}
        </form>
        <div className="signup-redirect">
          Don't have an account? <a href="/signup">Sign up now</a>
        </div>
      </div>
    </div>  
  );
};

export default Login;
