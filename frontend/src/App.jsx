import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobPostings from "./pages/JobPostings";
import StudentProfile from "./pages/StudentProfile";
import ApplyJob from "./pages/ApplyJob";

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
              <Navigate to={
                role === "admin" ? "/admin" 
                : role === "employer" ? "/employer/dashboard" 
                : "/dashboard"
              } />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to={
                role === "admin" ? "/admin" 
                : role === "employer" ? "/employer/dashboard" 
                : "/dashboard"
              } />
            ) : (
              <Register />
            )
          } 
        />

        {/* Protected Routes for Students */}
        <Route path="/dashboard" element={isAuthenticated && role === "user" ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated && role === "user" ? <StudentProfile /> : <Navigate to="/login" />} />
        <Route path="/apply/:jobId" element={isAuthenticated && role === "user" ? <ApplyJob /> : <Navigate to="/login" />} />

        {/* Protected Routes for Admin */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? (
              role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to={
                  role === "employer" ? "/employer/dashboard" 
                  : role === "user" ? "/dashboard" 
                  : "/"
                } />
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Protected Routes for Employers */}
        <Route path="/employer/dashboard" element={isAuthenticated && role === "employer" ? <EmployerDashboard /> : <Navigate to="/login" />} />

        {/* Job Postings (Accessible by all authenticated users) */}
        <Route path="/jobs" element={isAuthenticated ? <JobPostings /> : <Navigate to="/login" />} />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;