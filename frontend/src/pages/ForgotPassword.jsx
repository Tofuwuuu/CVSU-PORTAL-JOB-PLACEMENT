import { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Alert } from "@mui/material";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/forgot-password", { email });
      setMessage(response.data.message);
    } catch (err) {
      setError("User not found");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Forgot Password</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Email" onChange={(e) => setEmail(e.target.value)} margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Send Reset Email
        </Button>
      </form>
    </Container>
  );
}

export default ForgotPassword;
