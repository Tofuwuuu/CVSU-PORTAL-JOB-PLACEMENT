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
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

function AdminDashboard() {
  const [alumni, setAlumni] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = getToken();

  // Function to load alumni data from the backend
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadAlumni();
  }, [token, navigate]);

  // Function to handle blockchain verification
  const handleVerify = async (alumniId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/admin/verify/${alumniId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      // Optionally reload alumni data to update verification status
      await loadAlumni();
    } catch (error) {
      console.error("Verification error:", error);
      setSnackbar({
        open: true,
        message: "Verification failed: " + (error.response?.data?.detail || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Logout handler
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Display Snackbar Notifications */}
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

      <Typography variant="h5" gutterBottom>
        Alumni Records
      </Typography>
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
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Verify on Blockchain"}
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
