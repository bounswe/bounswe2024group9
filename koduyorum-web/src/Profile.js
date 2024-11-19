import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from './PageComponents';
import { LoadingComponent }  from './LoadingPage'
import './Profile.css';

const Profile = () => {
  const { username } = useParams(); // Extract username from the route
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch(`${process.env.REACT_APP_API_URL}/get_user_profile_by_username/${username}/`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.user);
        } else {
          console.error("Failed to fetch profile data");
          setError("Failed to load profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("An error occurred while fetching profile data.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProfile();
  }, [username]);

  // Handle profile picture upload
  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const updatedProfile = {
        ...profileData,
        profilePicture: URL.createObjectURL(file),
      };
      setProfileData(updatedProfile);

      // TODO: Add logic to upload the file to the server
    }
  };

  // Handle name change
  const handleNameChange = async () => {
    const newName = prompt("Enter your new name:");
    if (newName) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/edit_user_profile/${profileData.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        if (response.ok) {
          setProfileData((prevData) => ({ ...prevData, name: newName }));
        } else {
          console.error("Failed to update name");
        }
      } catch (error) {
        console.error("Error updating name:", error);
      }
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_user_profile/${profileData.id}/`, {
          method: 'DELETE',
        });
        if (response.ok) {
          localStorage.removeItem('authToken');
          navigate('/signup'); // Redirect to signup after deletion
        } else {
          console.error("Failed to delete account");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    // TODO: Implement password update logic
    alert("A password update link has been sent to your email.");
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="profile-page">
      {loading ? (
        <LoadingComponent />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="profile-content">
          <Navbar />
        <div className="profile-header">
          <div className="profile-picture">
            <img src={profileData.profilePicture || 'defaultProfilePic.png'} alt="Profile" />
            <input type="file" onChange={handleProfilePictureUpload} />
          </div>
          <div className="profile-name">
            <h2>{profileData.name || profileData.username}</h2>
            <button className="edit-button" onClick={handleNameChange}>Edit Name</button>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            My Questions
          </button>
          {/* <button
            className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            My Comments
          </button> */}
          <button
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'questions' && (
            <div className="content-list">
              {profileData.questions.map((q) => (
                <div key={q} className="content-item">
                  <h3>Question ID: {q}</h3>
                </div>
              ))}
            </div>
          )}
          {/* {activeTab === 'comments' && (
            <div className="content-list">
              {profileData.comments.map((c) => (
                <div key={c} className="content-item">
                  <p>Comment ID: {c}</p>
                </div>
              ))}
            </div>
          )} */}
          {activeTab === 'bookmarks' && (
            <div className="content-list">
              {profileData.bookmarks.map((b) => (
                <div key={b} className="content-item">
                  <h3>Bookmark ID: {b}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="account-actions">
          <button onClick={handlePasswordUpdate}>Update Password</button>
          <button onClick={handleDeleteAccount} className="delete-account">Delete Account</button>
        </div>
      </div>
      )}
      </div>
    );
};

export default Profile;
