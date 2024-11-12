import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostQuestion.css';

function PostQuestion() {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState([]); // Ensure it's initialized as an array
    const navigate = useNavigate();

    // Fetch available languages from backend
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/get_api_languages/');
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
        if (!title || !details || !language) {
            alert('All fields are required!');
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
            const response = await fetch('http://127.0.0.1:8000/create_question/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                alert('Question created successfully!');
                navigate('/feed');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create question');
            }
        } catch (error) {
            alert('Failed to create question');
            console.error('Error:', error);
        }
    };

    return (
        <div className="post-question-container">
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

            <input
                className="post-question-input"
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />

            <button className="post-question-submit" onClick={handleSubmit}>
                Submit Question
            </button>
        </div>
    );
}

export default PostQuestion;
