import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { server_url } from '../../Service/server_url';
import socket from '../socket'; // Import the Socket.IO client

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState('Chats');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userImage, setUserImage] = useState(sessionStorage.getItem('userImage') || 'default.jpg');
  const [newRequestCount, setNewRequestCount] = useState(0); // Track new requests
  const username = sessionStorage.getItem('username') || 'User';
  

  const navItems = [
    {
      name: 'Chats',
      icon: 'M8 10h8M8 14h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
      link: '/dashboard',
    },
    {
      name: 'New Friends',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7v-2a3 3 0 005.356-1.857M17 20V9M7 20V9m-3 9a3 3 0 003-3V5a3 3 0 00-6 0v10a3 3 0 003 3z',
      link: '/newcontact',
    },
    {
      name: 'Request',
      icon: 'M13 7H7v6h6v5l7-8-7-8v5z',
      link: '/request',
    },
    {
      name: 'Settings',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      link: '/settings',
    },
  ];

  useEffect(() => {
    // Listen for new request events
    socket.on('newRequest', (data) => {
      setNewRequestCount((prev) => prev + 1); 
    });

    // Clean up the socket listener on component unmount
    return () => {
      socket.off('newRequest');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const latestImage = sessionStorage.getItem('userImage') || 'default.jpg';
      setUserImage(latestImage);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        width: isCollapsed ? '5.5rem' : '16rem',
        background: '#ffffff',
        minHeight: '100vh',
        padding: '1.5rem 1rem',
        boxShadow: '2px 0 12px rgba(16, 185, 129, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.3s ease',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          {!isCollapsed && <h2 style={{ color: '#10b981', fontWeight: '700', fontSize: '1.5rem' }}>CONNECT HUB</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: '#10b981',
              cursor: 'pointer',
            }}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.link}
            onClick={() => {
              setActiveLink(item.name);
              if (item.name === 'Request') {
                setNewRequestCount(0); // Reset count when navigating to Request page
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '12px 14px',
              textDecoration: 'none',
              color: activeLink === item.name ? '#065f46' : '#475569',
              backgroundColor: activeLink === item.name ? '#d1fae5' : 'transparent',
              borderRadius: '10px',
              boxShadow: activeLink === item.name ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
              fontWeight: activeLink === item.name ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative', // For positioning the badge
            }}
          >
            <svg
              style={{
                flexShrink: 0,
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                width: '24px',
                height: '24px',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d={item.icon} />
            </svg>
            {!isCollapsed && <span>{item.name}</span>}
            {item.name === 'Request' && newRequestCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: isCollapsed ? '10px' : '20px',
                  backgroundColor: '#ef4444', // Red badge for visibility
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop:'11px',
                }}
              >
                {newRequestCount}
              </span>
            )}
          </a>
        ))}
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCollapsed ? 0 : '12px',
            padding: '12px 10px',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
          }}
        >
          <img
            src={`${server_url}/Uploads/${userImage}`}
            alt="User"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #10b981',
            }}
            onError={(e) => {
              e.target.src = `${server_url}/uploads/default.jpg`;
            }}
            draggable={false}
          />
          {!isCollapsed && (
            <span style={{ color: '#065f46', fontWeight: '600', marginLeft: '11px' }}>{username}</span>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            fontWeight: '600',
            marginTop: '20px',
            cursor: 'pointer',
            width: isCollapsed ? '42px' : '100%',
          }}
        >
          {isCollapsed ? '⎋' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;