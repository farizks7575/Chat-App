import React, { useState, useEffect } from 'react';
import Navbar from "../user/Navbar";
import { edituserAPI, getallusersAPI } from "../../Service/allapi";
import { jwtDecode } from "jwt-decode";


function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    password: "",
    profileImage: null,
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        fetchUserData(decoded.userId, token);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchUserData = async (id, token) => {
    try {
      const headers = { authorization: `Bearer ${token}` };
      const result = await getallusersAPI(headers);
      const user = result.data.find((u) => u._id === id);
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          gender: user.gender,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      console.log("Selected file:", files[0]); // Debug log
      setFormData(prev => ({
        ...prev,
        profileImage: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, gender, password, profileImage } = formData;
    if (!name || !email || !gender) {
      alert("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("gender", gender);
    if (password) data.append("password", password);
    if (profileImage) data.append("profile", profileImage); // Matches backend expectation

    const token = sessionStorage.getItem("token");
    if (token && userId) {
      const reqHeader = {
        authorization: `Bearer ${token}`,
      };

      try {
        const result = await edituserAPI(userId, data, reqHeader);
        if (result.status === 200) {
          alert("Profile updated successfully");
          sessionStorage.setItem("username", result.data.name);
          sessionStorage.setItem("email", result.data.email);
          if (result.data.image) {
            sessionStorage.setItem("userImage", result.data.image); // Save only the filename
          }
          fetchUserData(userId, token);
        } else {
          alert("Update failed");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Something went wrong");
      }
    } else {
      alert("Authentication token missing");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          backgroundColor: "#ffffff",
          border: "2px solid #10b981",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "500px",
        }}>
          <h2 style={{ color: "#10b981", textAlign: "center" }}>Settings</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label>Gender:</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="mb-3">
              <label>New Password (optional):</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-3">
              <label>Profile Image (optional):</label>
              <input type="file" name="profileImage" onChange={handleChange} className="form-control" accept="image/*" />
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#10b981", color: "#fff", width: "100%" }}>
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;