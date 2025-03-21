import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, removeToken } from "../auth";
import { Container, Typography, Button } from "@mui/material";

function AdminDashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");  // Redirect to login if no token
      return;
    }

    axios.get("http://127.0.0.1:8000/api/admin", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => setMessage(response.data.message))
      .catch(() => {
        removeToken();  // Remove token if it's invalid
        navigate("/login");  // Redirect to login
      });
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{message}</Typography>
      <Typography variant="body1">This is the admin-only dashboard.</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
}

export default AdminDashboard;
