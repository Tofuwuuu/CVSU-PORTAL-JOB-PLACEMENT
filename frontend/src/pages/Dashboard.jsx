import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, removeToken } from "../auth";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = getToken(); // retrieves your token

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get("http://127.0.0.1:8000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => setMessage(response.data.message))
    .catch(err => {
      console.error("Error fetching dashboard data", err);
      removeToken(); // remove invalid token
      navigate("/login");
    });
  }, [token, navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="body1">{message}</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
}

export default Dashboard;
