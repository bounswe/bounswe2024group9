import React, { useState } from "react";
import "./login_signup_style.css"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reset_password/`, { // TODO: Update the API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Sending reset links is not implemented yet. Please try again later.');
    }
  };

  return (
    <div className="wrapper_entrance">
      <div className="container_center">
        <h2>Reset Password</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Send Reset Link</button>
          {message && <p>{message}</p>}
          <div className="signin-redirect">
            Want to login? <a href="/login">Click Here!</a>
        </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
