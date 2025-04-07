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
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { getToken } from "../auth";

const EmployerDashboard = () => {
  const [jobStats, setJobStats] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [jobApplications, setJobApplications] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const token = getToken();

  // Load employer's job statistics
  const loadJobStats = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/employer/job_stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Job stats:", response.data); // Debug log
      setJobStats(response.data);
    } catch (error) {
      console.error("Error loading job stats:", error);
      setSnackbar({ open: true, message: "Failed to load job statistics", severity: "error" });
    }
  };

  // Toggle applications section for a specific job
  const toggleApplications = async (job_id) => {
    const isExpanded = expandedJobs[job_id];
    if (isExpanded) {
      setExpandedJobs({ ...expandedJobs, [job_id]: false });
    } else {
      if (!jobApplications[job_id]) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/employer/applications/${job_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`Applications for job ${job_id}:`, response.data); // Debug log
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

  // Update application status (Accept/Decline)
  const updateStatus = async (applicationId, newStatus, job_id) => {
    console.log("Updating status for application:", applicationId, newStatus); // Debug log
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
      console.log("Status update response:", response.data); // Debug log
      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      // Reload applications for this job after update
      const res = await axios.get(`http://127.0.0.1:8000/api/employer/applications/${job_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobApplications({ ...jobApplications, [job_id]: res.data });
    } catch (error) {
      console.error("Error updating application status:", error);
      const errDetail = error.response?.data?.detail;
      const errMsg = typeof errDetail === "object" ? JSON.stringify(errDetail) : errDetail || error.message;
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobStats.map((job) => (
              <React.Fragment key={job.job_id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleApplications(job.job_id)}
                      aria-label="expand row"
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
                        <Typography variant="h6" gutterBottom>Applications for Job ID: {job.job_id}</Typography>
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
                              {jobApplications[job.job_id].map((app) => {
                                // Use fallback: if app.id is undefined, try app._id
                                const appId = app.id || app._id;
                                console.log("Application object:", app, "Using ID:", appId); // Debug log
                                return (
                                  <TableRow key={appId}>
                                    <TableCell>{appId}</TableCell>
                                    <TableCell>{app.applicant_email}</TableCell>
                                    <TableCell>{app.cover_letter}</TableCell>
                                    <TableCell>{app.status}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => updateStatus(appId, "accepted", job.job_id)}
                                        style={{ marginRight: "8px" }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => updateStatus(appId, "declined", job.job_id)}
                                      >
                                        Decline
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
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
};

export default EmployerDashboard;
