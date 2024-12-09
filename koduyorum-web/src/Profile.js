import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from './PageComponents';
import { LoadingComponent } from './LoadingPage';
import PostPreview from './PostPreview';
import './Profile.css';
import { showNotification } from './NotificationCenter';
import NotificationCenter from './NotificationCenter';
import Comment from "./Comment";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditPopupOpen, setEditPopupOpen] = useState(false); // To toggle edit popup
    const [editData, setEditData] = useState({}); // For editing profile fields
    const [successMessage, setSuccessMessage] = useState(""); // To show success messages

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/get_user_profile_by_username/${username}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log('Profile data:', data);
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
            showNotification('Unable to upload profile picture. Please try again later.');
            // alert('Unable to upload profile picture. Please try again later.');
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
                    showNotification('Profile picture updated successfully!');
                    // alert('Profile picture updated successfully!');
                } else {
                    console.error('Failed to upload profile picture');
                    showNotification('Failed to upload profile picture. Please try again.');
                    // alert('Failed to upload profile picture. Please try again.');
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                // alert('An error occurred while uploading the profile picture.');
                showNotification('An error occurred while uploading the profile picture.');
            }
        }
    };

    // Handle opening the edit popup
  const openEditPopup = () => {
    setEditData({
      username: profileData.username,
      email: profileData.email,
      bio: profileData.bio || "",
    });
    setEditPopupOpen(true);
  };

  // Handle closing the edit popup
  const closeEditPopup = () => {
    setEditPopupOpen(false);
    setError("");
    setSuccessMessage("");
  };


  // Handle editing profile
  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID is undefined in localStorage');
      setError("Unable to update profile. Please try again later.");
      return;
    }

    try {
      const response = await fetch(
          `${process.env.REACT_APP_API_URL}/edit_user_profile/${userId}/`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'User-ID': userId,
            },
            body: JSON.stringify(editData),
          }
        );

        if (response.ok) {
          const updatedProfile = await response.json();
          setProfileData((prevData) => ({
            ...prevData,
            ...editData,
          }));
          setSuccessMessage("Profile updated successfully!");
          setTimeout(closeEditPopup, 2000); // Automatically close popup after success
        } else {
          const data = await response.json();
          setError(data.error || "Failed to update profile. Please try again.");
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setError("An error occurred while updating your profile.");
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
                    // alert('Account deleted successfully.');
                    showNotification('Account deleted successfully.');
                    
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('username');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
                    navigate('/login');
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
                // alert('A password update link has been sent to your email.');
                showNotification('A password update link has been sent to your email.');
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
                <div>
                    <Navbar />
                    <NotificationCenter />

                    <div className="profile-page">
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
                                <h1>{profileData.username}</h1>
                                <p className="bio">{profileData.bio || "No bio provided."}</p>
                                {isOwner && (
                                    <button className="edit-button" onClick={openEditPopup}>
                                        Edit Profile
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
                                    className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('comments')}
                                >
                                    Comments
                                </button>
                                <button
                                    className={`tab ${activeTab === 'annotations' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('annotations')}
                                >
                                    Annotations
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
                                    {profileData.questions.length > 0 ? (
                                        profileData.questions.map((q) => (
                                            <PostPreview
                                                key={q.id}
                                                post={q}
                                                onClick={() => navigate(`/question/${q.id}`)}
                                            />
                                        ))
                                    ) : (
                                        <p>You do not have any questions.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'bookmarks' && (
                                <div className="content-list">
                                    {profileData.bookmarks.length > 0 ? (
                                        profileData.bookmarks.map((b) => (
                                            <PostPreview
                                                key={b.id}
                                                post={{
                                                    post_id: b.id,
                                                    title: b.title,
                                                    description: b.details,
                                                    programmingLanguage: b.language,
                                                    topic: b.tags?.join(', '),
                                                    tags: b.tags, 
                                                    answered: b.answered,
                                                    likes: b.upvotes,
                                                    comments: b.comments?.length,
                                                }}
                                                onClick={() => navigate(`/question/${b.id}`)}
                                            />
                                        ))
                                    ) : (
                                        <p>You do not have any bookmarks.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'comments' && (
                                <div className="content-list">
                                    {profileData.comments.length > 0 ? (
                                        profileData.comments.map((comment, index) => (
                                            <React.Fragment key={index}>
                                              <Comment
                                                question_id={comment.question_id}
                                                number={index + 1}
                                                explanation={comment.details}
                                                code={comment.code_snippet}
                                                author={comment.user}
                                                questionAuthor={""}
                                                initialVotes={comment.upvotes}
                                                language = {comment.language_id}
                                                comment_id={comment.comment_id}
                                                answer_of_the_question={comment.answer_of_the_question}
                                                fetchComments={""}
                                              />
                                            </React.Fragment>
                                          ))
                                    ) : (
                                        <p>You do not have any comments.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'annotations' && (
                                <div className="content-list">
                                    {profileData.annotations.length > 0 ? (
                                        <div className="annotations-list">
                                            {profileData.annotations.map((annotation) => (
                                                <div key={annotation.annotation_id} className="annotation-card">
                                                    <div className="annotation-header">
                                                        <span className="annotation-id">#{annotation.annotation_id}</span>
                                                        <span className="annotation-date">
                                                            {annotation.annotation_date}
                                                        </span>
                                                    </div>
                                                    <div className="annotation-body">
                                                        <p className="annotation-text">{annotation.text}</p>
                                                        <div className="annotation-details">
                                                            <div className="annotation-meta">
                                                                <span className="label">Language ID:</span>
                                                                <span className="value">{annotation.language_qid}</span>
                                                            </div>
                                                            <div className="annotation-range">
                                                                <span className="label">Range:</span>
                                                                <span className="value">
                                                                    {annotation.annotation_starting_point} - {annotation.annotation_ending_point}
                                                                </span>
                                                            </div>
                                                            <div className="annotation-author">
                                                                <span className="label">Author:</span>
                                                                <span className="value">{annotation.author}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>You do not have any annotations.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {isOwner && (
                            <div className="account-actions">
                                <button className="edit-button" onClick={handlePasswordUpdate}>Update Password</button>
                                <button onClick={handleDeleteAccount} className="delete-account">
                                    Delete Account
                                </button>
                            </div>
                        )}

                        {isEditPopupOpen && (
                        <div className="edit-popup">
                            <div className="popup-content">
                            <h3>Edit Profile</h3>
                            {error && <p className="error-message">{error}</p>}
                            {successMessage && <p className="success-message">{successMessage}</p>}
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={editData.username}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    required
                                />
                                </div>
                                <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    required
                                />
                                </div>
                                <div className="form-group">
                                <label>Bio:</label>
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                />
                                </div>
                                <button type="submit" className="save-button">Save Changes</button>
                                <button type="button" className="cancel-button" onClick={closeEditPopup}>
                                Cancel
                                </button>
                            </form>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
