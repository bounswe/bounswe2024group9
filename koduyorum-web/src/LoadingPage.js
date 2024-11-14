import React, { useState, useEffect } from 'react';

const facts = [
  "Python was named after Monty Python, not the snake.",
  "Java was initially called Oak.",
  "The first computer virus was created in 1983.",
  "JavaScript was created in just 10 days.",
  "C is known as the mother of all programming languages.",
  "Ruby was influenced by Perl, Smalltalk, and Lisp.",
];

export const LoadingComponent = () => {
  const [randomFact, setRandomFact] = useState("");

  useEffect(() => {
    // Generate a random fact whenever the component mounts or loading changes
      const randomIndex = Math.floor(Math.random() * facts.length);
      setRandomFact(facts[randomIndex]);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading">Loading...</div>
      <div className="loading-fact">{randomFact}</div>
    </div>
  );
};

