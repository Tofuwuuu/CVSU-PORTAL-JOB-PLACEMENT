// src/pages/Register.jsx
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

function Register() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Automatically add role "user"
    const payload = { ...data, role: "user" };

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("User registered:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed", error.response ? error.response.data : error.message);
      setError(error.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Register</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Name" {...register("name")} margin="normal" required />
        <TextField fullWidth label="Email" {...register("email")} margin="normal" required />
        <TextField
          fullWidth
          label="Password"
          type="password"
          {...register("password")}
          margin="normal"
          required
        />
        {/* Role field removed from the form */}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
    </Container>
  );
}

export default Register;
