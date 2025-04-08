import React, { useState, useEffect, useContext } from "react";
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
  CircularProgress,
  Collapse,
  IconButton,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getToken } from "../auth";
import { AuthContext } from "../context/AuthContext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [expandedJobs, setExpandedJobs] = useState({});

  const token = getToken();
  const { role } = useContext(AuthContext);

  // Fetch job postings from backend API
  const loadJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map each job so that it always has an "id" field (use job.id or fallback to job._id)
      const jobsData = response.data.map((job) => ({
        id: job.id || job._id,
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        requirements: job.requirements,
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      setSnackbar({ open: true, message: "Failed to load job postings", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [token]);

  // Handle input for new job form (for employers)
  const handleInputChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // Create a new job posting (employer only)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/job", newJob, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: "Job created successfully!", severity: "success" });
      setNewJob({ title: "", description: "", company: "", location: "", requirements: "" });
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      setSnackbar({
        open: true,
        message: "Job creation failed: " + (error.response?.data?.detail || error.message),
        severity: "error",
      });
    }
  };

  // Toggle inline detailed view for a job posting
  const toggleJobDetails = (jobId) => {
    setExpandedJobs((prevState) => ({
      ...prevState,
      [jobId]: !prevState[jobId],
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
      <Typography variant="h4" gutterBottom>Job Postings</Typography>
      
      {/* Job Creation Form (visible for employers only) */}
      {role === "employer" && (
        <Paper sx={{ p: 2, mb: 4 }}>
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
            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              Create Job
            </Button>
          </form>
        </Paper>
      )}

      {/* Job Listings */}
      <Typography variant="h5" gutterBottom>Available Job Postings</Typography>
      {jobs.length === 0 ? (
        <Typography>No job postings available at the moment.</Typography>
      ) : (
        jobs.map((job) => (
          <Paper key={job.id} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6">{job.title}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {job.company} — {job.location}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  sx={{ mr: 2 }}
                  onClick={() => toggleJobDetails(job.id)}
                >
                  {expandedJobs[job.id] ? "Hide Details" : "View Details"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/apply/${job.id}`}
                >
                  Apply Now
                </Button>
              </Box>
            </Box>
            <Collapse in={expandedJobs[job.id]} timeout="auto" unmountOnExit>
              <Paper sx={{ mt: 2, p: 2 }}>
                <Typography variant="body1">
                  <strong>Description:</strong> {job.description}
                </Typography>
                <Typography variant="body1">
                  <strong>Requirements:</strong> {job.requirements}
                </Typography>
              </Paper>
            </Collapse>
          </Paper>
        ))
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

export default JobPostings;
