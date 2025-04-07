// frontend/src/App.jsx
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
import EmployerDashboard from "./pages/EmployerDashboard";
import StudentProfile from "./pages/StudentProfile";
import JobDetail from "./pages/JobDetail"; // Import the new component

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
              <Navigate to={role === "admin" ? "/admin" : (role === "employer" ? "/employer/dashboard" : "/dashboard")} />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={role === "admin" ? "/admin" : (role === "employer" ? "/employer/dashboard" : "/dashboard")} />
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
          path="/profile"
          element={isAuthenticated && role === "user" ? <StudentProfile /> : <Navigate to="/login" />}
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
          path="/employer/dashboard"
          element={isAuthenticated && role === "employer" ? <EmployerDashboard /> : <Navigate to="/login" />}
        />
        {/* New Detailed Job View Route */}
        <Route path="/job/:jobId" element={<JobDetail />} />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
