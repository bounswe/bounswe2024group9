import React, { useState } from "react";
import "./login_signup_style.css"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset previous messages
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reset_password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("A reset link has been sent to your email. Please check your inbox.");
      } else {
        setError(data.error || "Unable to send reset link. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while sending the reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper_entrance">
      <div className="container_center">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="signin-redirect">
          Want to login? <a href="/login">Click Here!</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
