import React, { useState } from "react";
import "./style.css"; // Import your CSS file

export const App = () => {
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
    <div className="App">
      <a href="../signin/App.jsx" className="top-link" id="link1">
        Sign In
      </a>
      <a href="../signup/App.jsx" className="top-link" id="link2">
        Sign Up
      </a>

      <div className="container">
        <h2>Sign In
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

export default App;
App;
