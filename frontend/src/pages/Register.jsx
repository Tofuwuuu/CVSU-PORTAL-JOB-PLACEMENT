// src/pages/Register.jsx
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", data);
      console.log("User registered:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Name" {...register("name")} margin="normal" />
        <TextField fullWidth label="Email" {...register("email")} margin="normal" />
        <TextField fullWidth label="Password" type="password" {...register("password")} margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
    </Container>
  );
}

export default Register;
