// components.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';

// LogoutButton Component
const LogoutButton = () => {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Remove the token from localStorage (or sessionStorage, or state)
      const token = localStorage.getItem('authToken');

      fetch(`${process.env.REACT_APP_API_URL}/logout/`, {
              method: 'POST',
              body: JSON.stringify({token}),
          }

      )
          .then(() => {
              // Redirect to login after logging out
              localStorage.removeItem('authToken');
              navigate('/login');
          })
          .catch((error) => {
              console.error('Logout failed:', error);
          });
      // Optionally call the server's logout endpoint
  };

  return <button className="nav-link" onClick={handleLogout}>Log Out</button>;
};

// Navbar Component with Search Functionality
export const Navbar = ({
  searchQuery,
  handleSearchQueryChange,
  handleSearch,
  handleEnter,
  searchResults,
  isLoading,
  searched,
  handleSearchResultClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img
          id="bar_logo"
          src="/resources/icon2-transparent.png"
          style={{ width: "75px", height: "auto", padding: "5px" }}
          alt="bar_logo"
          onClick={() => navigate('/feed')}
        />
        <button className="nav-link" onClick={() => navigate('/feed')}>Home</button>
        <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
      </div>

      {/* Search Input and Dropdown Container */}
      <div className="search-container">
        <input
          type="search"
          className="search-input"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleEnter();
          }}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>

        {/* Suggestions Dropdown */}
        {searched && searchResults.length > 0 && (
          <div className="search-suggestions">
            {isLoading ? (
              <p className="centered-search">Searching...</p>
            ) : (
              searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-suggestion"
                  onClick={() => handleSearchResultClick(result)}
                >
                  {result.languageLabel.value}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Log out Button */}
      <LogoutButton />
    </div>
  );
};

// LeftSidebar Component
export const LeftSidebar = ({ tags, handleTagClick }) => (
  <div className="tags-container">
    <h3 className="section-title">Popular Tags</h3>
    <ul className="tags-list">
      <li>
        <button onClick={() => handleTagClick('javascript')} className="tag-link">JavaScript</button>
      </li>
      <li>
        <button onClick={() => handleTagClick('python')} className="tag-link">Python</button>
      </li>
      <li>
        <button onClick={() => handleTagClick('react')} className="tag-link">React</button>
      </li>
      <li>
        <button onClick={() => handleTagClick('algorithms')} className="tag-link">Algorithms</button>
      </li>
    </ul>
  </div>
);

// RightSidebar Component
export const RightSidebar = () => (
  <div className="contributors-container">
    <h3 className="section-title">Top Contributors</h3>
    <ul className="contributors-list">
      <li>John Doe</li>
      <li>Jane Smith</li>
      <li>Bob Johnson</li>
    </ul>
  </div>
);
