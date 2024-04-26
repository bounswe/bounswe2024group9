import './App.css';
import React from 'react';
import SearchResults from './SearchResults';
import SearchDetails from './SearchDetails';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/result/:qid" element={<SearchDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}