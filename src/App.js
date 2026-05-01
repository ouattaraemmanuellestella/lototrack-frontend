import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/register';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Profile from './pages/Profil';
import LiveMap from './pages/LiveMap';
import Police from './pages/Police';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><Map /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/livemap" element={<PrivateRoute><LiveMap /></PrivateRoute>} />
        <Route path="/police" element={<PrivateRoute><Police /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;