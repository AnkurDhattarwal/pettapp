import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function HomeDele() {
  const location = useLocation();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "" });
  
  useEffect(() => {
    if (location.state && location.state.message) {
      setAlert({
        open: true,
        message: location.state.message,
        severity: location.state.severity,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCloseSnackbar = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div>
      <h1>Home Page</h1>
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
