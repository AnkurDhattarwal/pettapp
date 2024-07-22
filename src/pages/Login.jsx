import * as React from "react";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Typography from "@mui/material/Typography";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const [alert2, setAlert2] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [value, setValue] = React.useState("pet owner");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const firebase = useFirebase();
  const navigate = useNavigate();
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setAlert({ ...alert, open: false });
  };
  useEffect(() => {
    if (location.state && location.state.message) {
      setAlert2({
        open: true,
        message: location.state.message,
        severity: location.state.severity,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCloseSnackbar2 = () => {
    setAlert2({ ...alert2, open: false });
  };
  const mapFirebaseErrorToCustomMessage = (errorMessage) => {
    return errorMessage.replace("Firebase:", "PETT server:");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      localStorage.setItem("loginMode", value);
      await firebase.signinUserWithEmailAndPassword(email, password);

      console.log("Login successful");
      navigate("/home", {
        state: { message: `Login successful as ${value}`, severity: "success" },
      });
    } catch (error) {
      console.error("Login error:", error);
      const customErrorMessage = mapFirebaseErrorToCustomMessage(error.message);
      setAlert({ open: true, message: customErrorMessage, severity: "error" });
    }
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "6rem",
          minHeight: "100vh",
          "& > :not(style)": { m: 1 },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Typography
            style={{ fontWeight: "bold", textAlign: "center" }}
            variant="h4"
            gutterBottom
          >
            Login
          </Typography>
          <FormControl sx={{ m: 1, width: "35ch" }} variant="standard">
            <InputLabel htmlFor="input-with-icon-adornment">
              <Typography variant="h6" component="span">
                Email
              </Typography>
            </InputLabel>
            <Input
              id="input-with-icon-adornment"
              required
              startAdornment={
                <InputAdornment position="start">
                  <MailOutlineIcon />
                </InputAdornment>
              }
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </FormControl>
          <br />
          <FormControl sx={{ m: 1, width: "35ch" }} variant="standard">
            <InputLabel htmlFor="standard-adornment-password">
              <Typography variant="h6" component="span">
                Password
              </Typography>
            </InputLabel>
            <Input
              id="standard-adornment-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              startAdornment={
                <InputAdornment position="start">
                  <LockOpenIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <br />
          <FormControl>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              sx={{ marginLeft: "10px" }}
            >
              <Typography variant="subtitle1" component="span">
                Login as
              </Typography>
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel
                value="pet owner"
                control={<Radio required />}
                label={<Typography variant="body2">pet owner</Typography>}
              />
              <FormControlLabel
                value="organiser"
                control={<Radio required />}
                label={<Typography variant="body2">event organiser</Typography>}
              />
              <FormControlLabel
                value="medical professional"
                control={<Radio required />}
                label={
                  <Typography variant="body2">medical professional</Typography>
                }
              />
            </RadioGroup>
          </FormControl>
          <Stack
            spacing={2}
            direction="row"
            sx={{ justifyContent: "center", mt: 2 }}
          >
            <Button
              sx={{ border: "2px solid", fontWeight: "bold" }}
              size="small"
              variant="outlined"
              type="submit"
            >
              Login
            </Button>
          </Stack>
          <Stack
            spacing={2}
            direction="row"
            sx={{ justifyContent: "center", mt: 2 }}
          >
            <Link to="/signup">new user ?</Link>
          </Stack>
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
      <Snackbar
        open={alert2.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar2}
      >
        <Alert
          onClose={handleCloseSnackbar2}
          severity={alert2.severity}
          sx={{ width: "100%" }}
        >
          {alert2.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
