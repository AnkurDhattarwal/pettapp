import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useFirebase } from "../context/Firebase";

export default function ProfileForm() {
  const firebase = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [profileDetails, setProfileDetails] = useState({
    name: "",
    title: "",
    description: "",
    profileImage: "",
  });
  const [shownImg, setshownImg] = useState("");
  const [profileImageError, setProfileImageError] = useState("");

  useEffect(() => {
    const confirmFunn = async () => {
      const confirm = await firebase.isLogin;
      const confirmString = String(confirm);
      console.log(confirmString);
      if (confirmString === "false") {
        navigate("/login");
      }
    };
    confirmFunn();
  }, [firebase, navigate]);

  useEffect(() => {
    if (location.state && location.state.message) {
      setAlert({
        open: true,
        message: location.state.message,
        severity: location.state.severity,
      });

      // Clear state to avoid showing the alert again on page reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCloseSnackbar = () => {
    setAlert({ ...alert, open: false });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setshownImg(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      profileImage: file,
    }));
    setProfileImageError(""); // Clear the error when a file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileDetails.profileImage) {
      setProfileImageError("Please upload a profile picture.");
      return;
    }

    await firebase
      .writeUserData(
        profileDetails.name.toUpperCase(),
        profileDetails.title,
        profileDetails.description,
        profileDetails.profileImage
      )
      .then(() => {
        console.log("data written successfully");
      });
    navigate("/home");
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "30px" }}>
      <Typography style={{ fontWeight: "bold",textAlign: "center" }} variant="h4" gutterBottom>
        Profile Form
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Name"
          fullWidth
          margin="normal"
          autoComplete="username"
          variant="outlined"
          value={profileDetails.name}
          onChange={handleProfileChange}
          required
        />
        <TextField
          name="title"
          label="Title"
          fullWidth
          margin="normal"
          autoComplete="title"
          variant="outlined"
          value={profileDetails.title}
          onChange={handleProfileChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          autoComplete="description"
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
          value={profileDetails.description}
          onChange={handleProfileChange}
          required
        />
        <Button
          variant="contained"
          component="label"
          startIcon={<PhotoCamera />}
          sx={{ mt: 2 }}
        >
          Upload Profile Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
        {profileImageError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {profileImageError}
          </Typography>
        )}
        {profileDetails.profileImage && (
          <Box mt={2} display="flex" justifyContent="center">
            <Avatar
              alt="Profile Preview"
              src={shownImg}
              sx={{ width: 150, height: 150 }}
            />
          </Box>
        )}
        <Box mt={2} display="flex" justifyContent="center">
          <Button
            style={{ border: "2px solid", fontWeight: "bold" }}
            type="submit"
            variant="outlined"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
