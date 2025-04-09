import React, { useState, useEffect, useContext } from "react";
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
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { getToken } from "../auth";
import { AuthContext } from "../context/AuthContext";

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const { role } = useContext(AuthContext);

  // Fetch job postings for the employer
  const loadJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure each job has a proper id field (either job.id or job._id)
      const jobsData = response.data.map((job) => ({
        id: job.id || job._id,
        title: job.title,
        company: job.company,
        location: job.location,
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading job postings:", error);
      setSnackbar({ open: true, message: "Failed to load job postings", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Load job applications for a specific job
  const loadJobApplications = async (jobId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/employer/applications/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure that each application object has an "id" property
      const applicationsData = response.data.map((app) => ({
        id: app.id || app._id,
        applicant_email: app.applicant_email,
        cover_letter: app.cover_letter,
        status: app.status,
      }));
      setJobApplications((prev) => ({ ...prev, [jobId]: applicationsData }));
    } catch (error) {
      console.error(`Error loading applications for job ${jobId}:`, error);
      setSnackbar({ open: true, message: "Failed to load applications", severity: "error" });
    }
  };

  // Toggle applications collapse per job
  const toggleApplications = (jobId) => {
    if (!expandedJobs[jobId]) {
      loadJobApplications(jobId);
    }
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Update application status (Accept/Decline)
  const updateStatus = async (applicationId, newStatus, jobId) => {
    console.log("Updating status for application:", applicationId, "New status:", newStatus);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/employer/application/${applicationId}/status`,
        { status: newStatus }, // Ensure JSON body includes status field
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({ open: true, message: "Application status updated", severity: "success" });
      // Reload applications for this job after updating
      loadJobApplications(jobId);
    } catch (error) {
      console.error("Error updating application status:", error);
      const errDetail = error.response?.data?.detail;
      const errMsg = typeof errDetail === "object" ? JSON.stringify(errDetail) : errDetail || error.message;
      setSnackbar({ open: true, message: "Status update failed: " + errMsg, severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    loadJobs();
  }, [token]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading job postings...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Employer Dashboard</Typography>
      
      {jobs.map((job) => (
        <Paper key={job.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6">{job.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary">{job.company} — {job.location}</Typography>
            </Box>
            <Box>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={() => toggleApplications(job.id)}>
                {expandedJobs[job.id] ? "Hide Applications" : "View Applications"}
              </Button>
            </Box>
          </Box>

          <Collapse in={expandedJobs[job.id]} timeout="auto" unmountOnExit>
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>Applications for Job ID: {job.id}</Typography>
              {jobApplications[job.id] && jobApplications[job.id].length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Application ID</TableCell>
                        <TableCell>Applicant Email</TableCell>
                        <TableCell>Cover Letter</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobApplications[job.id].map((app) => {
                        // Use fallback in case app.id is missing
                        const applicationId = app.id || app._id;
                        console.log("Application object:", app, "Using ID:", applicationId);
                        return (
                          <TableRow key={applicationId}>
                            <TableCell>{applicationId}</TableCell>
                            <TableCell>{app.applicant_email}</TableCell>
                            <TableCell>{app.cover_letter}</TableCell>
                            <TableCell>{app.status}</TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => updateStatus(applicationId, "accepted", job.id)}
                                sx={{ mr: 1 }}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => updateStatus(applicationId, "declined", job.id)}
                              >
                                Decline
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2">No applications found.</Typography>
              )}
            </Paper>
          </Collapse>

          {/* Optional: Add a View Details button for job info (if needed) */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component={Link}
              to={`/job/${job.id}`}
            >
              View Job Details
            </Button>
          </Box>
        </Paper>
      ))}

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
