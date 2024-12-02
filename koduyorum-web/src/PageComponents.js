import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';

// LogoutButton Component
const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const token = localStorage.getItem('authToken');

    fetch(`${process.env.REACT_APP_API_URL}/logout/`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => {
        localStorage.removeItem('authToken');
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return <button className="px-4 py-2 text-white hover:bg-blue-200 rounded-md transition-colors" onClick={handleLogout}>Log Out</button>;
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
  const [username, setUsername] = useState(null);

  const handleProfileClick = () => {
    const storedUsername = localStorage.getItem('username');

    if (storedUsername) {
      setUsername(storedUsername);
      navigate(`/profile/${storedUsername}`);
    } else {
      console.error("No username found in local storage");
    }
  };

  return (
    <div className="navbar flex items-center justify-between w-full px-4 py-2">
      <div className="navbar-left flex items-center gap-4">
        <img
          id="bar_logo"
          src="/resources/icon2-transparent.png"
          style={{ width: "75px", height: "auto", padding: "5px" }}
          alt="bar_logo"
          onClick={() => navigate('/feed')}
        />
        <button className="nav-link" onClick={() => navigate('/feed')}>Home</button>
        <button className="nav-link" onClick={handleProfileClick}>Profile</button>
      </div>

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
export const RightSidebar = ({ topContributors }) => {
  const navigate = useNavigate();

  const handleContributorClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="contributors-container">
      <h3 className="section-title">Top Contributors</h3>
      <ul className="contributors-list">
        {topContributors && topContributors.length > 0 ? (
          topContributors.map((contributor, index) => (
            <li
              key={index}
              className="contributor-item"
              onClick={() => handleContributorClick(contributor.username)}
            >
              <span className="contributor-name">
                {contributor.name || contributor.username}
              </span>
              <span className="contributor-points">
                {contributor.contribution_points} points
              </span>
            </li>
          ))
        ) : (
          <li>No contributors found</li>
        )}
      </ul>
    </div>
  );
};
