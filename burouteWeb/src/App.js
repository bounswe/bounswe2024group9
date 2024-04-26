import './App.css';
import React from 'react';
import SearchResults from './SearchResults';
import SearchDetails from './SearchDetails';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/result/:qid" element={<SearchDetails />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}