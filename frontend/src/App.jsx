import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JobPostings from "./pages/JobPostings";
import JobApplications from "./pages/JobApplications";
import EmployerApplications from "./pages/EmployerApplications"; // New page for employer view

function App() {
  const { isAuthenticated, role } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={role === "admin" ? "/admin" : "/dashboard"} />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={role === "admin" ? "/admin" : "/dashboard"} />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes */}
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
        <Route
          path="/employer/applications"
          element={isAuthenticated && role === "employer" ? <EmployerApplications /> : <Navigate to="/dashboard" />}
        />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
