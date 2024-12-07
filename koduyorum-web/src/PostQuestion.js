import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './PostQuestion.css';
import { showNotification } from './NotificationCenter';
import NotificationCenter from './NotificationCenter';

import { predefinedTags } from './constants/tags';

function PostQuestion() {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState([]);
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
            // alert('All fields are required!');
            showNotification('Post must have a title and description!');
            return;
        }

        if (codeSnippet.trim() && !language) {
            showNotification('You must select a language for the written code!');
            return;
        }

        const user_id = localStorage.getItem('user_id');
        const postData = {
            title,
            language,
            details,
            code_snippet: codeSnippet,
            tags: tags,
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/create_question/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,
                    'User-ID': user_id
                },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                showNotification('Question created successfully!');
                const data = await response.json();
                console.log('Question created:', data);
                const question_id = data['question_id'];
                // alert('Question created successfully!');
                setTimeout(() => {
                    navigate(`/question/${question_id}`);
                }, 2000);
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to create question');
                // alert(data.error || 'Failed to create question');
            }
        } catch (error) {
            // alert('Failed to create question');
            showNotification('Failed to create question');
            console.error('Error:', error);
        }
    };

    return (
        <div className="post-question-container">
            <NotificationCenter />
            <h2>Create New Question</h2>

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
            <Select
                isMulti
                options={predefinedTags.map(tag => ({ value: tag, label: tag }))}
                value={tags.map(tag => ({ value: tag, label: tag }))}
                onChange={(selectedOptions) => setTags(selectedOptions.map(option => option.value))}
                placeholder="Select Tags"
            />
            <button className="post-question-submit" style={{ marginTop: '20px' }} onClick={handleSubmit}>
                Submit Question
            </button>
        </div>
    );
}

export default PostQuestion;
