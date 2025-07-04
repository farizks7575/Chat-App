import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userloginAPI } from '../../Service/allapi';
import { Link } from 'react-router-dom';

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
  form: {
    zIndex: 2,
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '25px',
    background: 'linear-gradient(90deg, #00cec9, #0984e3)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  input: {
    padding: '12px 16px',
    marginBottom: '18px',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '14px',
    width: '100%',
    backgroundColor: '#00cec9',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 206, 201, 0.3)',
  },
  buttonHover: {
    backgroundColor: '#00b5b2',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 206, 201, 0.4)',
  },
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [hover, setHover] = useState(false);

const handlelogin = async (e) => {
  e.preventDefault();
  const { email, password } = formData;

  if (!email || !password) {
    return toast.info('Please fill all fields');
  }

  // Admin shortcut check (without API call)
  if (email === 'admin@gmail.com' && password === '123') {
    toast.success('Welcome, Admin');
    sessionStorage.setItem('isAdmin', true);
    setTimeout(() => (window.location.href = '/admindashboard'), 2000);
    return;
  }

  try {
    const result = await userloginAPI({ email, password });

    if (result.status === 200) {
      const user = result.data.existinguser;
      toast.success(`Welcome, ${user.name}`);
      sessionStorage.setItem('token', result.data.token);
      sessionStorage.setItem('username', user.name);
      sessionStorage.setItem('userId', user._id);
      sessionStorage.setItem('userImage', user.image);
      sessionStorage.setItem('userGender', user.gender);

      setTimeout(() => (window.location.href = '/dashboard'), 2000);
    } else {
      toast.error(result.data.message || 'Login failed');
    }
  } catch (error) {
    toast.error('Invalid credentials or server error');
  }
};


  return (
    <div style={styles.page}>
      <form onSubmit={handlelogin} style={styles.form}>
        <h2 style={styles.heading}>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={styles.input}
          required
        />
        <button
          type="submit"
          style={hover ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Login
        </button>

        <p style={{ marginTop: '16px', fontSize: '0.95rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0984e3', textDecoration: 'none', fontWeight: '500' }}>
            Register
          </Link>
        </p>
      </form>

      <ToastContainer />
    </div>
  );
};

export default Login;
