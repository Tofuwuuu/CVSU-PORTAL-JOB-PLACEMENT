import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    requirements: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const token = getToken();
  const { role } = useContext(AuthContext);

  // Function to load all job postings
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
  }, []); // Only runs once
  
  // Handle input changes in the new job form
  const handleInputChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // Submit the new job posting (only for employers)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/job", newJob, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      setSnackbar({ open: true, message: "Job created successfully!", severity: "success" });
      // Reset form
      setNewJob({ title: "", description: "", company: "", location: "", requirements: "" });
      // Reload job postings
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      setSnackbar({
        open: true,
        message: "Job creation failed: " + (error.response?.data?.detail || error.message),
        severity: "error"
      });
    }
  };

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Job Postings</Typography>
      
      {/* Only show job creation form if user is an employer */}
      {role === "employer" && (
        <Paper style={{ padding: "16px", marginBottom: "16px" }}>
          <Typography variant="h6" gutterBottom>Create a New Job Posting</Typography>
          <form onSubmit={handleCreateJob}>
            <TextField
              label="Title"
              name="title"
              value={newJob.title}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              label="Company"
              name="company"
              value={newJob.company}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Location"
              name="location"
              value={newJob.location}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Requirements"
              name="requirements"
              value={newJob.requirements}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              required
            />
            <Button variant="contained" color="primary" type="submit" style={{ marginTop: "16px" }}>
              Create Job
            </Button>
          </form>
        </Paper>
      )}

      {/* Display all job postings (for both employers and students) */}
      <Typography variant="h5" gutterBottom>Available Job Postings</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.description}</TableCell>
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

export default JobPostings;
