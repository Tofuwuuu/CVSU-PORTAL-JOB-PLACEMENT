import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Container, Typography, Alert } from "@mui/material";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/reset-password", {
        token,
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);  // Redirect to login
    } catch (err) {
      setError("Invalid or expired token");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Reset Password</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="New Password" type="password" onChange={(e) => setNewPassword(e.target.value)} margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Reset Password
        </Button>
      </form>
    </Container>
  );
}

export default ResetPassword;
