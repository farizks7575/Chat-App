import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from './socket'; // Import centralized socket
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './user/Dashboard';
import Newcontact from './user/Newcontact';
import Settings from './user/Settings';
import Request from './user/Request';

//Admin

import Admindashboard from './admin/Admindashboard';


function AppWrapper() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/login' || currentPath === '/register';
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    if (!isAuthPage && userId && token) {
      socket.emit('register_user', userId);
      socket.on('new_request', (data) => {
        toast.info(data.message, {
          position: 'top-right',
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true,
        });
      });
    }

    return () => {
      socket.off('new_request');
    };
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/newcontact" element={<Newcontact />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/request" element={<Request />} />

        {/* Admindashboard */}

         <Route path="/admindashboard" element={<Admindashboard />} />

      </Routes>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;