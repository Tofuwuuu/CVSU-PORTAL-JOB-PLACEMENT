import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";
import { getToken } from "../auth";

function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const token = getToken();

  // Load employer's job postings (you might need an endpoint to get only employer jobs)
  const loadEmployerJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      setSnackbar({
        open: true,
        message: "Failed to load your job postings.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    loadEmployerJobs();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Employer Dashboard</Typography>
      <Typography variant="subtitle1">Your Job Postings and Application Statistics</Typography>
      
      {/* Display job postings in a table */}
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Applications Received</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.applications_count || 0}</TableCell>
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

export default EmployerDashboard;
