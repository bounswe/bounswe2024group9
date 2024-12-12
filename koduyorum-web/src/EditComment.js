import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import { showNotification } from './NotificationCenter';
import NotificationCenter from './NotificationCenter';

import './PostComment.css';

function EditComment(props) {
    const [details, setDetails] = useState(props.details);
    const [codeSnippet, setCodeSnippet] = useState(props.codeSnippet);
    const [language, setLanguage] = useState(props.language);
    const [availableLanguages, setAvailableLanguages] = useState([]); // Ensure it's initialized as an array
    const navigate = useNavigate();
    // Fetch available languages from backend
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/get_api_languages/`);
                const data = await response.json();

                if (data && Array.isArray(data.languages)) {
                    setAvailableLanguages(data.languages);
                } else if (data && typeof data.languages === 'object') {
                    setAvailableLanguages(Object.keys(data.languages)); // Handle object case
                } else {
                    setAvailableLanguages([]);
                }
            } catch (error) {
                console.error('Error fetching languages:', error);
                setAvailableLanguages([]); // Set to empty array on error
            }
        };
        fetchLanguages();
    }, []);

    // Submit comment to backend
    const handleSubmit = async () => {
        if (!details || !language) {
            showNotification('All fields are required!');
            // alert('All fields are required!');
            return;
        }

        const postData = {
            'language': language,
            'details': details,
            'code_snippet': codeSnippet
        };

        try {
            const user_id = localStorage.getItem('user_id');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/edit_comment/${props.comment_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id
                },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                // alert('Comment edited successfully!');
                showNotification('Comment edited successfully!');
                props.fetchComments();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to edit comment');
                // alert(data.error || 'Failed to edit comment');
            }
        } catch (error) {
            showNotification('Failed to edit comment');
            // alert('Failed to edit comment');
            console.error('Error:', error);
        } finally {
            props.closePopup()
        }
    };

    return (

        <div>
            <NotificationCenter />
            <h2>Edit Comment</h2>
            <div className="post-comment-language">
                <label>Select Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="">Choose Language</option>
                    {availableLanguages.map((lang, index) => (
                        <option key={index} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            <textarea
                className="post-comment-textarea"
                placeholder="Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            />

            <textarea
                className="post-comment-textarea code-snippet"
                placeholder="Code Snippet (optional)"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
            />

            <button className="post-comment-submit" onClick={handleSubmit}>
                Edit Comment
            </button>
        </div>
    );
}
EditComment.propTypes = {
    comment_id : PropTypes.number,
    language : PropTypes.string,
    details : PropTypes.string,
    codeSnippet : PropTypes.string
}

export default EditComment;
