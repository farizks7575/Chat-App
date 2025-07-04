import React from 'react';
import { Link } from 'react-router-dom';

const App = () => {
  const styles = {
    page: {
      backgroundColor: '#f9f9f9',
      backgroundImage: "url('/backgroundimage.png')", // Adjust the path as needed
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      textAlign: 'center',
      padding: '0 20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundSize: 'cover',       
      backgroundRepeat: 'no-repeat', 
      backgroundPosition: 'center',  
    },
    content: {
      maxWidth: '600px',
      zIndex: 2,
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#2d3436',
      lineHeight: '1.2',
    },
    highlight: {
      background: 'linear-gradient(120deg, #00cec9 0%, #0984e3 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '1.2rem',
      fontWeight: '400',
      marginBottom: '40px',
      color: '#636e72',
      lineHeight: '1.6',
    },
    button: {
      padding: '14px 36px',
      backgroundColor: '#00cec9',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 206, 201, 0.3)',
      position: 'relative',
      overflow: 'hidden',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 206, 201, 0.4)',
      backgroundColor: '#00b5b2',
    },
   
   
   
    
  };

  const [hover, setHover] = React.useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <h1 style={styles.title}>
          Connect with <span style={styles.highlight}>ChatApp</span>
        </h1>
        <p style={styles.subtitle}>
          Simple, secure messaging that keeps you in touch with the people who matter most.
          No distractions, just real conversations.
        </p>
        <Link to="/login">
          <button
            style={hover ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            Start Messaging
          </button>
        </Link>
      </div>
    </div>
  );
};

export default App;