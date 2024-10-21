import React, { useState, useEffect } from "react";
import "./login_signup_style.css"; 
import { useAuth } from "./hooks/AuthProvider";
import { useLocation } from 'react-router-dom';

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null); // State for storing error messages
  const [showLoginMessage, setShowLoginMessage] = useState(false); // State for controlling the visibility of the login message
  const [loading, setLoading] = useState(false); // State for controlling the loading indicator

  // const auth = useAuth();
  const location = useLocation();
  const fromPrivate = location.state?.from === 'private';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowLoginMessage(false); // Hide the login message when the form is submitted
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
          //remember: rememberMe ? 'on' : '',
        }),
        credentials: 'same-origin',
      });

      
      if (response.ok) {
        setError(null);
        // auth.login(); 
        window.location.href = '/feed';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginMessage(true); // Show the message after 0.5 seconds
    }, 800);

    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, []);

  return (
    <div className="wrapper_entrance">
      <div className="container_center">
        <h2>Sign In
        </h2>
        <div className="error-message" id="not_logged_in">
          {fromPrivate && showLoginMessage && <p>Please log in to continue.</p>}
        </div>
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
