import React, { useState } from "react";
import "./login_signup_style.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const [error, setError] = useState(null);
  const [kvkk, setKvkk] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password1: password,
            password2: confirmPassword,
          }),
          credentials: "same-origin",
        }
      );

      if (response.ok) {
        setSuccessMessage("Sign up successful! Redirecting to the login page...");
        setTimeout(() => {
          window.location.href = "/login"; // Redirect after 2 seconds
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "An error occurred while signing up. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper_entrance">
      <div className="container_center">
        <h2>Sign Up</h2>
        {/* Success Message */}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
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
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-group kvkk-container">
            <input
              type="checkbox"
              id="kvkk"
              name="kvkk"
              value={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
            />
            <label htmlFor="kvkk">
              I agree to the{" "}
              <a
                href="https://www.resmigazete.gov.tr/eskiler/2018/03/20180310-5.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                KVKK terms
              </a>
            </label>
          </div>
          {loading ? (
            <button type="submit" className="login-button loading" disabled>
              Loading...
            </button>
          ) : (
            <button type="submit" id="signup-button" disabled={!kvkk}>
              Sign Up
            </button>
          )}
        </form>
        <div className="signin-redirect">
          Already have an account? <a href="/login">Sign in now</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
