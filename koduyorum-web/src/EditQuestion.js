import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import './PostQuestion.css';

export default function EditQuestion(props) {
    const [title, setTitle] = useState(props.title);
    const [details, setDetails] = useState(props.details);
    const [codeSnippet, setCodeSnippet] = useState(props.code_snippet);
    const [language, setLanguage] = useState(props.language);
    const [tags, setTags] = useState(props.tags);
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

    // Submit question to backend
    const handleSubmit = async () => {
        if (!title || !details) {
            props.showNotification('Title and details are required!');
            // alert('All fields are required!');
            return;
        }

        const postData = {
            title,
            language,
            details,
            code_snippet: codeSnippet,
            tags: tags.split(',').map(tag => tag.trim())
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/edit_question/${props.question_id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json',
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                props.showNotification('Question updated successfully!');

                props.closePopup();
                props.fetchQuestion();
                // alert('Question updated successfully!');
            } else {
                const data = await response.json();
                props.showNotification(data.error || 'Failed to updated question');
                // alert(data.error || 'Failed to updated question');
            }
        } catch (error) {
            props.showNotification('Failed to update question');
            // alert('Failed to update question');
            console.error('Error:', error);
        }
    };

    return (
        <div className="post-question-container">
            <h2>Edit Question</h2>

            <input
                className="post-question-input"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="post-question-language">
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
                className="post-question-textarea"
                placeholder="Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            />

            <textarea
                className="post-question-textarea code-snippet"
                placeholder="Code Snippet (optional)"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
            />

            <input
                className="post-question-input"
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />

            <button className="post-question-submit" onClick={handleSubmit}>
                Edit Question
            </button>
        </div>
    );
}
EditQuestion.propTypes = {
    question_id: PropTypes.number,
    title: PropTypes.string,
    code_snippet: PropTypes.string,
    details: PropTypes.string,
    language: PropTypes.string,
    tags: PropTypes.string,
  };
