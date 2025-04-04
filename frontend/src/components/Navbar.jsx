import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

function Navbar() {
  const { isAuthenticated, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          CvSU Job Placement Portal
        </Typography>

        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button color="inherit" component={Link} to="/">Home</Button>

          {isAuthenticated ? (
            <>
              {role === "admin" && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Dashboard
                </Button>
              )}
              {(role === "employer" || role === "user") && (
                <Button color="inherit" component={Link} to="/jobs">
                  Job Postings
                </Button>
              )}
              {role === "user" && (
                <Button color="inherit" component={Link} to="/applications">
                  Job Applications
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
