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
          element={isAuthenticated && role === "student" ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated && role === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />}
        />
        
        {/* Job Postings - Restricted to Employers */}
        <Route
          path="/jobs"
          element={isAuthenticated && role === "employer" ? <JobPostings /> : <Navigate to="/dashboard" />}
        />

        {/* Job Applications - Restricted to Students */}
        <Route
          path="/applications"
          element={isAuthenticated && role === "student" ? <JobApplications /> : <Navigate to="/dashboard" />}
        />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
