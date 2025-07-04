import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userregisterAPI } from '../../Service/allapi';
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
    padding: '30px 25px',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '20px',
    background: 'linear-gradient(90deg, #00cec9, #0984e3)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  input: {
    padding: '10px 14px',
    marginBottom: '14px',
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
  },
  button: {
    padding: '12px',
    width: '100%',
    backgroundColor: '#00cec9',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 206, 201, 0.3)',
    marginTop: '8px',
  },
  buttonHover: {
    backgroundColor: '#00b5b2',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 206, 201, 0.4)',
  },
  genderGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '14px',
  },
  genderLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '14px',
  },
  imagePreview: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #f0f0f0',
    marginBottom: '8px',
  },
  uploadButton: {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  hiddenInput: {
    display: 'none',
  },
  loginLink: {
    marginTop: '12px',
    fontSize: '0.9rem',
    color: '#666',
    '& a': {
      color: '#0984e3',
      textDecoration: 'none',
      fontWeight: '500',
      marginLeft: '4px',
    }
  }
};

const Signup = () => {
  const [alldata, setalldata] = useState({
    name: "",
    email: "",
    password: "",
    gender: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [hover, setHover] = useState(false);

  const handleregister = async (e) => {
    e.preventDefault();

    const { name, email, password, gender } = alldata;
    if (!name || !email || !password || !gender || !imageFile) {
      return toast.info("Please fill all fields and upload an image.");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("gender", gender);
    formData.append("profile", imageFile);

    try {
      const result = await userregisterAPI(formData);
      if (result.status === 201) {
        toast.success("Registration successful!");
        setalldata({ name: "", email: "", password: "", gender: "" });
        setImageFile(null);
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        toast.error(result.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Server error. Try again later.");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleregister} style={styles.form}>
        <h2 style={styles.heading}>Register</h2>

        <div style={styles.imageUploadContainer}>
          <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                style={styles.imagePreview}
              />
            ) : (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                color: '#999',
                fontSize: '0.8rem'
              }}>
                No Image
              </div>
            )}
            
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            style={styles.hiddenInput}
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <input
          type="text"
          placeholder="Name"
          style={styles.input}
          value={alldata.name}
          onChange={e => setalldata({ ...alldata, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={alldata.email}
          onChange={e => setalldata({ ...alldata, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={alldata.password}
          onChange={e => setalldata({ ...alldata, password: e.target.value })}
        />

        <div style={styles.genderGroup}>
          <label style={styles.genderLabel}>
            <input
              type="radio"
              value="Male"
              checked={alldata.gender === "Male"}
              onChange={e => setalldata({ ...alldata, gender: e.target.value })}
            /> Male
          </label>
          <label style={styles.genderLabel}>
            <input
              type="radio"
              value="Female"
              checked={alldata.gender === "Female"}
              onChange={e => setalldata({ ...alldata, gender: e.target.value })}
            /> Female
          </label>
        </div>

        <button 
          type="submit" 
          style={hover ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Register
        </button>
        
        <p style={styles.loginLink}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;