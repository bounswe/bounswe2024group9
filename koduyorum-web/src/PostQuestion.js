import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './PostQuestion.css';
import { showNotification } from './NotificationCenter';
import NotificationCenter from './NotificationCenter';

const predefinedTags = [
    // Programming Fundamentals
    'Algorithms',
    'Data Structures',
    'Recursion',
    'Dynamic Programming',
    'Object-Oriented Programming',
    'Functional Programming',
    'Memory Management',
    'Pointers',
    'Arrays',
    'Linked Lists',
    'Trees',
    'Graphs',
    'Hash Tables',
    'Stacks',
    'Queues',
    'Sorting',
    'Searching',
    'Time Complexity',
    'Space Complexity',
    'Big O Notation',

    // Software Development Concepts
    'Design Patterns',
    'SOLID Principles',
    'Clean Code',
    'Code Review',
    'Debugging',
    'Error Handling',
    'Exception Handling',
    'Logging',
    'Documentation',
    'Unit Testing',
    'Integration Testing',
    'Test-Driven Development',
    'Continuous Integration',
    'Version Control',
    'Git',
    'Code Quality',
    'Performance Optimization',
    'Refactoring',
    'Technical Debt',

    // Web Development
    'Frontend',
    'Backend',
    'Full Stack',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Express.js',
    'REST API',
    'GraphQL',
    'WebSockets',
    'Authentication',
    'Authorization',
    'OAuth',
    'JWT',
    'Web Security',
    'CORS',
    'HTTP',
    'HTTPS',
    'SSL/TLS',
    'Responsive Design',
    'Progressive Web Apps',
    'Web Components',
    'DOM',
    'Browser APIs',
    'Web Performance',

    // Database & Storage
    'SQL',
    'NoSQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Database Design',
    'Data Modeling',
    'Indexing',
    'Query Optimization',
    'Transactions',
    'ACID',
    'Caching',
    'Data Migration',
    'Backups',
    'Data Warehousing',

    // DevOps & Infrastructure
    'DevOps',
    'CI/CD',
    'Docker',
    'Kubernetes',
    'Containerization',
    'Microservices',
    'Service Mesh',
    'Cloud Computing',
    'AWS',
    'Azure',
    'Google Cloud',
    'Serverless',
    'Infrastructure as Code',
    'Configuration Management',
    'Monitoring',
    'Logging',
    'System Design',
    'Load Balancing',
    'Scalability',
    'High Availability',

    // Programming Languages
    'Python',
    'Java',
    'C',
    'C++',
    'C#',
    'Ruby',
    'PHP',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'Scala',
    'R',
    'MATLAB',
    'Assembly',
    'Bash',
    'PowerShell',

    // Mobile Development
    'iOS Development',
    'Android Development',
    'React Native',
    'Flutter',
    'Mobile UI/UX',
    'App Store',
    'Google Play',
    'Mobile Security',
    'Push Notifications',
    'Mobile Performance',
    'Mobile Testing',

    // AI & Machine Learning
    'Machine Learning',
    'Deep Learning',
    'Neural Networks',
    'Computer Vision',
    'Natural Language Processing',
    'Reinforcement Learning',
    'Data Mining',
    'Feature Engineering',
    'Model Training',
    'Model Deployment',
    'TensorFlow',
    'PyTorch',
    'Scikit-learn',

    // Security
    'Cyber Security',
    'Encryption',
    'Penetration Testing',
    'Vulnerability Assessment',
    'Network Security',
    'Application Security',
    'Security Protocols',
    'Cryptography',
    'Security Best Practices',
    'Ethical Hacking',

    // Software Architecture
    'Architecture Patterns',
    'Domain-Driven Design',
    'Event-Driven Architecture',
    'Monolithic Architecture',
    'Distributed Systems',
    'API Design',
    'System Integration',
    'Message Queues',
    'Caching Strategies',
    'Data Flow',

    // Development Methodologies
    'Agile',
    'Scrum',
    'Kanban',
    'Waterfall',
    'Lean',
    'XP',
    'Project Management',
    'Team Collaboration',
    'Code Review Process',
    'Documentation Practices',

    // Emerging Technologies
    'Blockchain',
    'IoT',
    'Edge Computing',
    'Quantum Computing',
    'AR/VR',
    '5G',
    'Web3',
    'DeFi',
    'Smart Contracts',
    'Metaverse',

    // Career & Professional Development
    'Career Development',
    'Interview Preparation',
    'Code Challenge',
    'Best Practices',
    'Soft Skills',
    'Technical Writing',
    'Public Speaking',
    'Leadership',
    'Mentoring',
    'Remote Work',

    // Tools & Development Environment
    'IDE',
    'VS Code',
    'IntelliJ',
    'Eclipse',
    'Command Line',
    'Terminal',
    'Development Tools',
    'Productivity Tools',
    'Code Editors',
    'Debugging Tools'
];

function PostQuestion() {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState([]);
    const [availableLanguages, setAvailableLanguages] = useState([]); // Ensure it's initialized as an array
    const [postType, setPostType] = useState('question'); // default to 'question'
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
        if (!title || !details || !language) {
            // alert('All fields are required!');
            showNotification('All fields are required!');
            return;
        }
        console.log('Tags:', tags);
        const user_id = localStorage.getItem('user_id');
        
        const postData = {
            title,
            language,
            details,
            code_snippet: codeSnippet,
            tags: tags,
            post_type: postType,
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/create_question/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,
                    'User-ID': user_id
                },
                body: JSON.stringify(postData),
            });

            console.log('Response:', response);

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

    const handleCancel = () => {
        navigate('/feed'); // Redirect to Feed page
    };

    return (
        <div className="post-question-container">
            <NotificationCenter />
            <h2>Create New Post</h2>

            <div className="post-type-selection">
                <label>Select Post Type:</label>
                    <input
                        type="radio"
                        value="question"
                        checked={postType === 'question'}
                        onChange={() => setPostType('question')}
                    />
                    Question
                    <input
                        type="radio"
                        value="discussion"
                        checked={postType === 'discussion'}
                        onChange={() => setPostType('discussion')}
                    />
                    Discussion
            </div>

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
            <button className="post-question-cancel" style={{ marginTop: '20px' }} onClick={handleCancel}>
                    Cancel
            </button>
        </div>
    );
}

export default PostQuestion;
