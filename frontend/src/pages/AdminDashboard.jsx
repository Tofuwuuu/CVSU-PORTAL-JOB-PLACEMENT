import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, removeToken } from "../auth";
import { 
  Container, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from "@mui/material";

// Define your blockchain API URL (update as needed)
const BLOCKCHAIN_API_URL = "http://localhost:8001/verify";

function AdminDashboard() {
  const [alumni, setAlumni] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = getToken();

  // Function to load alumni records from the backend
  const loadAlumni = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/alumni", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumni(response.data);
    } catch (error) {
      console.error("Error fetching alumni data:", error);
      removeToken();
      navigate("/login");
    }
  };

  // Load alumni on component mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadAlumni();
  }, [token, navigate]);

  // Function to trigger blockchain verification via the REST API
  const handleVerify = async (alumniId) => {
    try {
      // POST request to your blockchain API endpoint
      const response = await axios.post(
        BLOCKCHAIN_API_URL,
        { alumni_id: alumniId },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(response.data.message);
      // Optionally reload alumni data to reflect updated status
      loadAlumni();
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("Verification failed: " + (error.response?.data?.detail || error.message));
    }
  };

  // Logout handler
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      {message && <Typography variant="body1" color="primary">{message}</Typography>}

      <Typography variant="h5" gutterBottom>Alumni Records</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alumni.map((alumnus) => (
              <TableRow key={alumnus._id}>
                <TableCell>{alumnus.name}</TableCell>
                <TableCell>{alumnus.email}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleVerify(alumnus._id)}
                  >
                    Verify on Blockchain
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleLogout} 
        style={{ marginTop: "20px" }}
      >
        Logout
      </Button>
    </Container>
  );
}

export default AdminDashboard;
