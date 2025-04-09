// frontend/src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Collapse,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { getToken } from "../auth";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function EmployerDashboard() {
  const [jobStats, setJobStats] = useState([]);
  // Map to store which job's applications are expanded
  const [expandedJobs, setExpandedJobs] = useState({});
  // Store applications for each job, keyed by job_id
  const [jobApplications, setJobApplications] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const token = getToken();

  // Load job statistics (job postings by this employer)
  const loadJobStats = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/employer/job_stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobStats(response.data);
    } catch (error) {
      console.error("Error loading job stats:", error);
      setSnackbar({ open: true, message: "Failed to load job statistics", severity: "error" });
    }
  };

  // Toggle the collapse for a specific job to load and show its applications
  const toggleApplications = async (job_id) => {
    const isExpanded = expandedJobs[job_id];
    if (isExpanded) {
      // Collapse the section
      setExpandedJobs({ ...expandedJobs, [job_id]: false });
    } else {
      // Expand the section and fetch applications if not already loaded
      if (!jobApplications[job_id]) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/employer/applications/${job_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setJobApplications({ ...jobApplications, [job_id]: response.data });
        } catch (error) {
          console.error("Error loading applications for job", job_id, error);
          setSnackbar({
            open: true,
            message: "Failed to load applications for this job",
            severity: "error",
          });
        }
      }
      setExpandedJobs({ ...expandedJobs, [job_id]: true });
    }
  };

  // Function to update the application status (accept/decline)
  const updateStatus = async (applicationId, newStatus, job_id) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/employer/application/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      loadApplications(); // Refresh the applications after status update
    } catch (error) {
      console.error("Error updating application status:", error);
      // If error.response.data.detail is an object, convert it to a string
      const errDetail = error.response?.data?.detail;
      const errMsg =
        typeof errDetail === "object" ? JSON.stringify(errDetail) : errDetail || error.message;
      setSnackbar({
        open: true,
        message: "Status update failed: " + errMsg,
        severity: "error",
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    loadJobStats();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Employer Dashboard</Typography>
      <Typography variant="subtitle1" gutterBottom>Your Job Postings and Application Statistics</Typography>
      
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Job ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Applications Received</TableCell>
              <TableCell>View Applications</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobStats.map((job) => (
              <React.Fragment key={job.job_id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => toggleApplications(job.job_id)}
                    >
                      {expandedJobs[job.job_id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{job.job_id}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.applications_count}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => toggleApplications(job.job_id)}>
                      {expandedJobs[job.job_id] ? "Hide Applications" : "View Applications"}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedJobs[job.job_id]} timeout="auto" unmountOnExit>
                      <Paper style={{ margin: "16px", padding: "16px" }}>
                        <Typography variant="h6" gutterBottom>
                          Applications for Job ID: {job.job_id}
                        </Typography>
                        {jobApplications[job.job_id] && jobApplications[job.job_id].length > 0 ? (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Application ID</TableCell>
                                <TableCell>Applicant Email</TableCell>
                                <TableCell>Cover Letter</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {jobApplications[job.job_id].map((app) => (
                                <TableRow key={app.id}>
                                  <TableCell>{app.id}</TableCell>
                                  <TableCell>{app.applicant_email}</TableCell>
                                  <TableCell>{app.cover_letter}</TableCell>
                                  <TableCell>{app.status}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => updateStatus(app.id, "accepted", job.job_id)}
                                      style={{ marginRight: "8px" }}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="error"
                                      size="small"
                                      onClick={() => updateStatus(app.id, "declined", job.job_id)}
                                    >
                                      Decline
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography variant="body2">No applications found.</Typography>
                        )}
                      </Paper>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
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
