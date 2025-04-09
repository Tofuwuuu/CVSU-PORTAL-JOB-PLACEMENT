<<<<<<< HEAD
// frontend/src/App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
=======
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
>>>>>>> parent of e26d513 (adding Admin to database)
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
<<<<<<< HEAD
import AdminDashboard from "./pages/AdminDashboard";
import JobPostings from "./pages/JobPostings";
<<<<<<< HEAD
=======
import JobApplications from "./pages/JobApplications";
<<<<<<< HEAD
>>>>>>> parent of e9a4337 (job and student profile)
=======
>>>>>>> parent of e9a4337 (job and student profile)
import EmployerDashboard from "./pages/EmployerDashboard";  // Ensure correct import

function App() {
  const { isAuthenticated, role } = useContext(AuthContext);
=======

const theme = createTheme({
  palette: {
    primary: {
      main: "#006400", // CvSU Green
    },
    secondary: {
      main: "#228B22",
    },
    background: {
      default: "#f4f4f4",
    },
  },
});

function App() {
  const isAuthenticated = localStorage.getItem("token"); // Check if logged in
>>>>>>> parent of e26d513 (adding Admin to database)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
<<<<<<< HEAD

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  role === "admin"
                    ? "/admin"
                    : role === "employer"
                    ? "/employer/dashboard"
                    : "/dashboard"
                }
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  role === "admin"
                    ? "/admin"
                    : role === "employer"
                    ? "/employer/dashboard"
                    : "/dashboard"
                }
              />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes for Students */}
        <Route
          path="/dashboard"
          element={isAuthenticated && role === "user" ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated && role === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/jobs"
          element={isAuthenticated && (role === "employer" || role === "user") ? <JobPostings /> : <Navigate to="/login" />}
        />
        <Route
          path="/applications"
          element={isAuthenticated && role === "user" ? <JobApplications /> : <Navigate to="/dashboard" />}
        />
        {/* Employer Dashboard Route */}
        <Route
          path="/employer/dashboard"
          element={isAuthenticated && role === "employer" ? <EmployerDashboard /> : <Navigate to="/login" />}
        />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
=======
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
>>>>>>> parent of e26d513 (adding Admin to database)
      </Routes>
    </ThemeProvider>
  );
}

export default App;
