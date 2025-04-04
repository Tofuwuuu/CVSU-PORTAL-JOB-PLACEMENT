import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { getToken } from "../auth";

function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: "", description: "", company: "", location: "", requirements: "" });
  const token = getToken();

  const loadJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleInputChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/job", newJob, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewJob({ title: "", description: "", company: "", location: "", requirements: "" });
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Job Postings</Typography>
      <Paper style={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h6">Create a New Job Posting</Typography>
        <TextField label="Title" name="title" value={newJob.title} onChange={handleInputChange} fullWidth margin="normal" />
        <TextField label="Description" name="description" value={newJob.description} onChange={handleInputChange} fullWidth margin="normal" />
        <TextField label="Company" name="company" value={newJob.company} onChange={handleInputChange} fullWidth margin="normal" />
        <TextField label="Location" name="location" value={newJob.location} onChange={handleInputChange} fullWidth margin="normal" />
        <TextField label="Requirements" name="requirements" value={newJob.requirements} onChange={handleInputChange} fullWidth margin="normal" />
        <Button variant="contained" color="primary" onClick={handleCreateJob}>Create Job</Button>
      </Paper>

      <Typography variant="h5" gutterBottom>Available Job Postings</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default JobPostings;
