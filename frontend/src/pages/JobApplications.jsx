import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";

function JobApplications() {
  const [jobs, setJobs] = useState([]);
  const [application, setApplication] = useState({ job_id: "", cover_letter: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const token = getToken();

  // Load job postings to display available jobs
  const loadJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching job postings:", error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    setApplication({ ...application, [e.target.name]: e.target.value });
  };

  // Submit job application
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/apply", application, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      setSnackbar({ open: true, message: "Application submitted successfully!", severity: "success" });
      // Optionally reset the form
      setApplication({ job_id: "", cover_letter: "" });
    } catch (error) {
      console.error("Error applying for job:", error);
      setSnackbar({
        open: true,
        message: "Application submission failed: " + (error.response?.data?.detail || error.message),
        severity: "error"
      });
    }
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Job Applications</Typography>
      
      <Paper style={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h6" gutterBottom>Apply for a Job</Typography>
        <form onSubmit={handleApply}>
          <TextField
            label="Job ID"
            name="job_id"
            value={application.job_id}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Cover Letter"
            name="cover_letter"
            value={application.cover_letter}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button variant="contained" color="primary" type="submit" style={{ marginTop: "16px" }}>
            Submit Application
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>Available Job Postings</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default JobApplications;
