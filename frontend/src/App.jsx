// frontend/src/App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";           // Student dashboard
import AdminDashboard from "./pages/AdminDashboard";   // Admin dashboard
import EmployerDashboard from "./pages/EmployerDashboard"; // Employer dashboard
import JobPostings from "./pages/JobPostings";           // Job postings page (list of jobs)
import StudentProfile from "./pages/StudentProfile";     // Student profile page
import ApplyJob from "./pages/ApplyJob";                 // Job application submission page

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
          path="/profile"
          element={isAuthenticated && role === "user" ? <StudentProfile /> : <Navigate to="/login" />}
        />

        {/* Protected Routes for Admin */}
        <Route
          path="/admin"
          element={isAuthenticated && role === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Routes for Employers */}
        <Route
          path="/employer/dashboard"
          element={isAuthenticated && role === "employer" ? <EmployerDashboard /> : <Navigate to="/login" />}
        />

        {/* Job Postings (Accessible by any authenticated user) */}
        <Route path="/jobs" element={isAuthenticated ? <JobPostings /> : <Navigate to="/login" />} />

        {/* Job Application Submission Page (for students) */}
        <Route
          path="/apply/:jobId"
          element={isAuthenticated && role === "user" ? <ApplyJob /> : <Navigate to="/login" />}
        />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
