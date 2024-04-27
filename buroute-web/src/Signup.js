import React, { useState } from "react";
import "./style.css"; // Import your CSS file

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/database_search/create_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          name: username, // Assuming username is also the name
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
       
        console.log("User created successfully:", data);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="App">
        <a href="../signin/App.jsx" className="top-link" id="link1">
          Sign In
        </a>
        <a href="../signup/App.jsx" className="top-link" id="link2">
          Sign Up
        </a>
      <div className="container">
        <h2>Sign Up
          <img
            src="https://private-user-images.githubusercontent.com/68972243/313346109-38df63a1-f4b4-4499-9ba7-e2b89e40ef78.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTM0NDg2NjYsIm5iZiI6MTcxMzQ0ODM2NiwicGF0aCI6Ii82ODk3MjI0My8zMTMzNDYxMDktMzhkZjYzYTEtZjRiNC00NDk5LTliYTctZTJiODllNDBlZjc4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA0MTglMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNDE4VDEzNTI0NlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTMzOThhMDAxMmI1MmRmMTY2MjE5MjA2NzgyYmJkNDVhN2NkNmRjOWFlNTJkMTBkN2Y3OGE4NDI0MGQ1MzUyZjYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.J1gXmkyW027jU5UyRz8I07VbgElZbfU-mXyppaliH-o"
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
          <div className="news-container">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Subscribe to our newsletter</label>
          </div>
          <div className="error-message">
            {error && <p>{error}</p>}
          </div>
          <button type="submit" id="signup-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
