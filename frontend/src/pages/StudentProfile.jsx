import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";

function StudentProfile() {
  const [profile, setProfile] = useState({ name: "", email: "", skills: "" });
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
        headers: { Authorization: `Bearer ${token}` },
      });
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
        onChange={handleInputChange}
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
      <Button variant="contained" color="primary" onClick={handleUpdateProfile}>
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
