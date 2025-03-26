import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, removeToken } from "../auth";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

function AdminDashboard() {
  const [alumni, setAlumni] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://127.0.0.1:8000/api/admin/alumni", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => setAlumni(response.data))
    .catch(() => {
      removeToken();
      navigate("/login");
    });
  }, [token, navigate]);

  const handleVerify = async (alumniId) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/admin/verify/${alumniId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Verification failed");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      {message && <Typography variant="body1" color="primary">{message}</Typography>}

      {/* Alumni Table */}
      <Typography variant="h5" gutterBottom>Alumni Records</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Verification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alumni.map((alumnus) => (
              <TableRow key={alumnus._id}>
                <TableCell>{alumnus.name}</TableCell>
                <TableCell>{alumnus.email}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleVerify(alumnus._id)}>
                    Verify on Blockchain
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="secondary" onClick={() => { removeToken(); navigate("/login"); }}>
        Logout
      </Button>
    </Container>
  );
}

export default AdminDashboard;
