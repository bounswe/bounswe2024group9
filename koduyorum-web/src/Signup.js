import React, { useState } from "react";
import "./login_signup_style.css";
import { useAuth } from "./hooks/AuthProvider";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kvkk, setKvkk] = useState(false);
  const auth = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      setLoading(false);
      return;
    }

    // Block of meeting password requirements
    if (password.match(/\d+/) === null) {
      setError("Password must contain at least one number.");
      setLoading(false);
      return;
    }
    if (password.match(/[A-Z]/) === null) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }
    if (password.match(/[a-z]/) === null) {
      setError("Password must contain at least one lowercase letter.");
      setLoading(false);
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError("Password must be 8 to 16 characters long.");
      setLoading(false);
      return;
    }

    // valid email format
    if (
      email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) === null
    ) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }

    // username requirements
    if (!username.match(/^[0-9a-zA-Z]+$/)) {
      setError("Username must only consist of alphanumerical characters.");
      setLoading(false);
      return;
    }

    if (username.length < 5 || username.length > 16) {
      setError("Username must be 5 to 16 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/django_app/signup/`, // TODO: Update the API URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username,
            email,
            password,
          }),
          credentials: 'same-origin',
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = "/login";
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
        <h2>
          Sign Up
        </h2>
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
