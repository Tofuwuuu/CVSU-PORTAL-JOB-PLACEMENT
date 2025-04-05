import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import { getToken } from "../auth";

function EmployerApplications() {
  const [jobId, setJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const token = getToken();

  const handleInputChange = (e) => {
    setJobId(e.target.value);
  };

  // Function to load applications for a given job ID
  const loadApplications = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/employer/applications/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data);
      if (response.data.length === 0) {
        setSnackbar({ open: true, message: "No applications found for this job", severity: "info" });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch applications: " + (error.response?.data?.detail || error.message),
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Job Applications for a Specific Job</Typography>
      
      <Paper style={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h6" gutterBottom>Enter Job ID</Typography>
        <TextField
          label="Job ID"
          value={jobId}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <Button variant="contained" color="primary" onClick={loadApplications}>
          Load Applications
        </Button>
      </Paper>
      
      {applications.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>Applications</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application ID</TableCell>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Applicant Email</TableCell>
                  <TableCell>Cover Letter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>{app.job_id}</TableCell>
                    <TableCell>{app.applicant_email}</TableCell>
                    <TableCell>{app.cover_letter}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

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

export default EmployerApplications;
