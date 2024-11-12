import React, { useState, useEffect } from 'react';
import './SurveyPage.css';

const SurveyPage = () => {
  const [languages, setLanguages] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestsOptions] = useState(['Machine Learning', 'Gaming', 'Computer Vision', 'NLP', 'Web Development', 'Data Science', 'Recursion']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/get_api_languages/`);
        const data = await response.json();
        setLanguages(data.languages); 
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, []);

  const toggleLanguage = (languageName) => {
    setSelectedLanguages((prevSelected) =>
      prevSelected.includes(languageName)
        ? prevSelected.filter((lang) => lang !== languageName) // Remove if already selected
        : [languageName, ...prevSelected] // Add to the top if not selected
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert(`Selected Languages: ${selectedLanguages.join(', ')}\nSelected Interests: ${selectedInterests.join(', ')}`);
      setLoading(false);
    }, 1000);
  };

  const handleInterestChange = (event) => {
    const { value, checked } = event.target;
    setSelectedInterests((prevSelected) =>
      checked ? [...prevSelected, value] : prevSelected.filter((interest) => interest !== value)
    );
  };

  return (
    <div className="survey-container">
      <h2 className="survey-title">Tell us about yourself!</h2>
      <form onSubmit={handleSubmit} className="survey-form">
        
        {/* Language Dropdown */}
        <label className="survey-label">Select languages you know:</label>
        <select
          onChange={(e) => toggleLanguage(e.target.value)}
          className="survey-select"
          value="" 
        >
          <option value="">Select a language</option>
          
          {/* Selected languages at the top */}
          {selectedLanguages.map((language) => (
            <option key={language} value={language}>
              {language} (Selected)
            </option>
          ))}

          {/* Remaining languages */}
          {Object.entries(languages)
            .filter(([name]) => !selectedLanguages.includes(name))
            .map(([name, id]) => (
              <option key={id} value={name}>{name}</option>
            ))}
        </select>

        {/* Interests Checkbox */}
        <label className="survey-label">Select Your Interests:</label>
        <div className="checkbox-group">
          {interestsOptions.map((interest) => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                value={interest}
                onChange={handleInterestChange}
                checked={selectedInterests.includes(interest)}
              />
              {interest}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="survey-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default SurveyPage;