import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddApplication from './pages/AddApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import EditApplication from './pages/EditApplication';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddApplication />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/applications/:id/edit" element={<EditApplication />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-container">
            <p className="footer-text">
              <strong>JobTrack</strong> — MERN Stack Job Application Tracker
            </p>
            <p className="footer-subtext">
              Built with Node.js, Express, MongoDB Atlas, and React.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
