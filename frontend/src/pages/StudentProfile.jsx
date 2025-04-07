// frontend/src/pages/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";

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

  const loadProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/profile", {
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
  };

  const handleUpdateProfile = async () => {
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
      setSnackbar({ open: true, message: "Failed to update profile", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StudentProfile;
