import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from './PageComponents';
import { LoadingComponent } from './LoadingPage';
import PostPreview from './PostPreview';
import './Profile.css';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/get_user_profile_by_username/${username}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    
                    setProfileData(data.user);
                    if (data.user['profile_pic'] != null) {    
                      const updatedProfilePictureUrl = `${process.env.REACT_APP_API_URL}${data.user['profile_pic']}`;
                      console.log(data.user['profile_pic'])
                      setProfileData((prevData) => ({
                          ...prevData,
                          profilePicture: updatedProfilePictureUrl,
                      }));
                    }

                    // Check ownership
                    const loggedInUsername = localStorage.getItem('username');
                    setIsOwner(loggedInUsername === data.user.username);
                } else {
                    console.error('Failed to fetch profile data');
                    setError('Failed to load profile data.');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('An error occurred while fetching profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleProfilePictureUpload = async (event) => {
        const userId = localStorage.getItem('user_id'); // Fetch the user ID from localStorage
        if (!userId) {
            console.error('User ID is undefined in localStorage');
            alert('Unable to upload profile picture. Please try again later.');
            return;
        }

        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_pic', file);

            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/upload-profile-pic/`,
                    {
                        method: 'POST',
                        headers: { 'User-ID': userId },
                        body: formData,
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    const updatedProfilePictureUrl = `${process.env.REACT_APP_API_URL}${data.url}`;
                    console.log('Updated profile picture URL:', updatedProfilePictureUrl);
                    setProfileData((prevData) => ({

                        ...prevData,
                        profilePicture: updatedProfilePictureUrl,
                    }));
                    alert('Profile picture updated successfully!');
                } else {
                    console.error('Failed to upload profile picture');
                    alert('Failed to upload profile picture. Please try again.');
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alert('An error occurred while uploading the profile picture.');
            }
        }
    };

    const handleNameChange = async () => {
        const newName = prompt('Enter your new name:');
        if (newName) {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/edit_user_profile/${profileData.id}/`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-ID': profileData.id,
                        },
                        body: JSON.stringify({ name: newName }),
                    }
                );
                if (response.ok) {
                    setProfileData((prevData) => ({ ...prevData, name: newName }));
                } else {
                    console.error('Failed to update name');
                }
            } catch (error) {
                console.error('Error updating name:', error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (
            window.confirm(
                'Are you sure you want to delete your account? This action cannot be undone.'
            )
        ) {
            try {
                const userId = localStorage.getItem('user_id');
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/delete_user_profile/${userId}/`,
                    {
                        method: 'DELETE',
                        headers: { 'User-ID': userId },
                    }
                );
                if (response.ok) {
                    alert('Account deleted successfully.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('username');
                    navigate('/signup');
                } else {
                    console.error('Failed to delete account');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    const handlePasswordUpdate = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reset_password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profileData.email }),
            });
            if (response.ok) {
                alert('A password update link has been sent to your email.');
            } else {
                console.error('Failed to send password reset link');
            }
        } catch (error) {
            console.error('Error sending password reset link:', error);
        }
    };



    return (
        <div>
        {loading ? (
                <LoadingComponent /> // Show loading screen while data is being fetched
            ) : (
        
            <div className="profile-page">
                <Navbar />
                <div className="profile-header">
                    <div className="profile-picture">
                        <img
                            src={profileData.profilePicture || `/resources/default-pp.jpeg`}
                            alt="Profile"
                        />
                        {isOwner && (
                            <>
                                <div className="profile-picture-overlay">UPDATE</div>
                                <input type="file" onChange={handleProfilePictureUpload} />
                            </>
                        )}
                    </div>
                    <div className="profile-name">
                        <h2>{profileData.name || profileData.username}</h2>
                        {isOwner && (
                            <button className="edit-button" onClick={handleNameChange}>
                                Edit Name
                            </button>
                        )}
                    </div>
                </div>

                {isOwner && (
                  <div className="profile-tabs">
                      <button
                          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                          onClick={() => setActiveTab('questions')}
                      >
                          Questions
                      </button>
                      <button
                          className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                          onClick={() => setActiveTab('bookmarks')}
                      >
                          Bookmarks
                      </button>
                  </div>
                )}

                <div className="profile-content">
                    {activeTab === 'questions' && (
                        <div className="content-list">
                            {profileData.questions.map((q) => (
                                <PostPreview
                                    key={q.id}
                                    post={{
                                        post_id: q.id,
                                        title: q.title,
                                        description: q.details,
                                        programmingLanguage: q.language,
                                        topic: q.tags?.join(', '),
                                        answered: q.answered,
                                        likes: q.upvotes,
                                        comments: q.comments?.length,
                                    }}
                                    onClick={() => navigate(`/question/${q.id}`)}
                                />
                            ))}
                        </div>
                    )}
                    {activeTab === 'bookmarks' && (
                        <div className="content-list">
                            {profileData.bookmarks.map((b) => (
                                <PostPreview
                                    key={b.id}
                                    post={{
                                        post_id: b.id,
                                        title: b.title,
                                        description: b.details,
                                        programmingLanguage: b.language,
                                        topic: b.tags?.join(', '),
                                        answered: b.answered,
                                        likes: b.upvotes,
                                        comments: b.comments?.length,
                                    }}
                                    onClick={() => navigate(`/question/${b.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {isOwner && (
                    <div className="account-actions">
                        <button onClick={handlePasswordUpdate}>Update Password</button>
                        <button onClick={handleDeleteAccount} className="delete-account">
                            Delete Account
                        </button>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default Profile;
