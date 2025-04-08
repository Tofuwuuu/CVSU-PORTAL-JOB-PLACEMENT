// frontend/src/pages/ApplyJob.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const [coverLetter, setCoverLetter] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In our backend, we assume the endpoint /api/user/apply uses the token to set the applicant_email.
      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/apply",
        {
          job_id: jobId,
          cover_letter: coverLetter,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({ open: true, message: "Application submitted successfully!", severity: "success" });
      setCoverLetter("");
      // Optionally redirect to a confirmation or dashboard page:
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Application submission error:", error);
      const errDetail = error.response?.data?.detail;
      const errMsg = typeof errDetail === "object" ? JSON.stringify(errDetail) : errDetail || error.message;
      setSnackbar({ open: true, message: "Application submission failed: " + errMsg, severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Apply for Job</Typography>
      <Typography variant="body1" gutterBottom>
        Job ID: {jobId}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Cover Letter"
          multiline
          rows={6}
          fullWidth
          required
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit">
          Submit Application
        </Button>
      </form>
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

export default ApplyJob;
