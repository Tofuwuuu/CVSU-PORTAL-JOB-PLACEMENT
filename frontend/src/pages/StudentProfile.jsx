import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Grid,
  Link,
  FormHelperText
} from "@mui/material";
import { getToken, handleLogout } from "../auth";

function StudentProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    skills: "",
    bio: "",
    resume_url: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const token = getToken();

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = "Name is required";
    if (profile.skills && !/^[\w\s]+(,\s*[\w\s]+)*$/.test(profile.skills)) {
      newErrors.skills = "Please enter comma-separated skills";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setSnackbar({ open: true, message: "Failed to load profile", severity: "error" });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    
    setIsUpdating(true);
    try {
      const response = await axios.put("http://127.0.0.1:8000/api/user/profile", profile, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
      setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      const message = error.response?.data?.message || "Failed to update profile";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Student Profile</Typography>
      <Typography variant="body1" gutterBottom>View and update your profile information.</Typography>
      
      <TextField
        label="Name"
        name="name"
        value={profile.name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        value={profile.email}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Skills"
        name="skills"
        value={profile.skills}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Bio"
        name="bio"
        value={profile.bio}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      <TextField
        label="Resume URL"
        name="resume_url"
        value={profile.resume_url}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleUpdateProfile} style={{ marginTop: "16px" }}>
        Update Profile
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: "100%", maxWidth: 400 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StudentProfile;