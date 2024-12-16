import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';
import Select from 'react-select';
import { predefinedTags } from './constants/tags';
import { languages } from './constants/tags';

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

  return <button className="px-4 py-2 text-white hover:bg-blue-200 rounded-md transition-colors" onClick={handleLogout}>LOGOUT</button>;
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
export const LeftSidebar = ({ tags, handleTagClick, language, top_tags,filters, setFilters, handleApplyFilters }) => {

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="sidebar-layout">
      <div className="tags-container">
        <h3 className="section-title">Popular Tags</h3>
        <ul className="tags-list">
          {top_tags.map((tag) => (
            <li key={tag}>
              <button 
                onClick={() => handleTagClick(tag.toLowerCase())} 
                className="tag-link"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="filters-container">
        <h3 className="filters-title">Filters</h3>
        <select
          className="filter-dropdown"
          onChange={(e) => handleFilterChange('status', e.target.value)}
          defaultValue="all"
        >
          <option value="all">All Posts</option>
          <option value="answered">Answered</option>
          <option value="unanswered">Unanswered</option>
          <option value="discussion">Discussion</option>
        </select>
        
        <select
          className="filter-dropdown"
          onChange={(e) => handleFilterChange('language', e.target.value)}
          value={language !== "" ? language : filters.language}
          disabled={language !== ""}
          style={{ marginBottom: '0', opacity: language !== "" ? 0.7 : 1 }}
        >
          {language !== "" && !["all", ...languages].includes(language) && (
            <option value={language}>{language}</option>
          )}
          <option value="all">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <div className="tag-filter-container">
          <Select
              isMulti
              options={predefinedTags.map(tag => ({ value: tag, label: tag }))}
              value={filters.tags?.map(tag => ({ value: tag, label: tag })) || []}
              onChange={(selectedOptions) => handleFilterChange('tags', selectedOptions?.map(option => option.value) || [])}
              placeholder="Select Tags"
              className="tag-select"
          />
        </div>

        <div className="date-filters">
          <div className="date-input-group">
            <label>
              Start Date:
            </label>
            <input
              type="date"
              className="date-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="date-input-group">
            <label>
              End Date:
            </label>
            <input
              type="date"
              className="date-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={async () => handleApplyFilters(1)}
          className="apply-filters-btn "
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

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
