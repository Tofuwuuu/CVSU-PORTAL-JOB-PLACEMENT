import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { getToken } from "../auth";

function JobApplications() {
  const [jobs, setJobs] = useState([]);
  const [application, setApplication] = useState({ job_id: "", cover_letter: "" });
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
    setApplication({ ...application, [e.target.name]: e.target.value });
  };

  const handleApply = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/apply", application, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplication({ job_id: "", cover_letter: "" });
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Application submission failed!");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Job Applications</Typography>
      <Paper style={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h6">Apply for a Job</Typography>
        <TextField label="Job ID" name="job_id" value={application.job_id} onChange={handleInputChange} fullWidth margin="normal" />          
        <TextField label="Cover Letter" name="cover_letter" value={application.cover_letter} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} />
        <Button variant="contained" color="primary" onClick={handleApply}>Apply</Button>
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
    </Container>
  );
}

export default JobApplications;
