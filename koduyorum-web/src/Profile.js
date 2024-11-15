import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/AuthProvider';
import { Navbar } from './PageComponents';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    profilePicture: user.profilePicture || '',
  });
  const [activeTab, setActiveTab] = useState('questions');
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Fetch user data for posts, comments, and bookmarks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsResponse = await fetch(`/api/user/${user.id}/posts`);
        const commentsResponse = await fetch(`/api/user/${user.id}/comments`);
        const bookmarksResponse = await fetch(`/api/user/${user.id}/bookmarks`);
        
        setUserPosts(await postsResponse.json());
        setUserComments(await commentsResponse.json());
        setBookmarks(await bookmarksResponse.json());
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, [user.id]);

  const handleTabSwitch = (tab) => setActiveTab(tab);

  const handleNameChange = () => {
    // Logic for updating the user's name
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData({ ...profileData, profilePicture: URL.createObjectURL(file) });
      // Logic to upload to server
    }
  };

  const handleDeleteAccount = async () => {
    // Logic to delete account
  };

  const handlePasswordUpdate = () => {
    // Logic to send password update link to user's email
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-header">
        <div className="profile-picture">
          <img src={profileData.profilePicture || 'defaultProfilePic.png'} alt="Profile" />
          <input type="file" onChange={handleProfilePictureUpload} />
        </div>
        <div className="profile-name">
          <h2>{profileData.name}</h2>
          <button className="edit-button" onClick={handleNameChange}>Edit Name</button>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => handleTabSwitch('questions')}>My Questions</button>
        <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => handleTabSwitch('comments')}>My Comments</button>
        <button className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => handleTabSwitch('bookmarks')}>Bookmarks</button>
      </div>

      <div className="profile-content">
        {activeTab === 'questions' && (
          <div className="content-list">
            {userPosts.map((post) => (
              <div key={post.id} className="content-item">
                <h3>{post.title}</h3>
                <p>{post.body}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="content-list">
            {userComments.map((comment) => (
              <div key={comment.id} className="content-item">
                <p>{comment.body}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'bookmarks' && (
          <div className="content-list">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="content-item">
                <h3>{bookmark.title}</h3>
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
  );
};

export default Profile;
