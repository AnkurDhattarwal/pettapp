import React, { useState, useEffect } from "react";
import noEventFound from "../Images/noPetFound.png";
import "../css/MyPets.css";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { onValue } from "firebase/database";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import loading from "../Images/loading.gif";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    description: "",
    breed: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const muitheme = createTheme({
    components: {
      MuiFab: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: "grey",
              color: "white",
            },
          },
        },
      },
    },
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const firebase = useFirebase();
  const navigate = useNavigate();

  const handleClickOpen = async () => {
    const login = await firebase.isLogin;
    if (!login) navigate("/login");
    else setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    setFormValues({
      name: "",
      category: "",
      description: "",
      breed: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormValues({
      ...formValues,
      [name]: files ? files[0] : value,
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = formValues.name ? "" : "Name is required";
    tempErrors.category = formValues.category ? "" : "Category is required";
    tempErrors.description = formValues.description
      ? ""
      : "Description is required";
    tempErrors.breed = formValues.breed ? "" : "Breed is required";
    tempErrors.image = formValues.image ? "" : "Image is required";

    setErrors(tempErrors);

    setTimeout(() => {
      setErrors({});
    }, 3000);

    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await firebase.updateEvents(formValues);
      console.log("Form submitted:", formValues);
      handleClose();
    }
  };

  const handleDelete = async () => {
    await firebase.deleteEvent(eventToDelete.uid);
    setEvents(events.filter((event) => event.uid !== eventToDelete.uid));
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  const handleImageDialogClose = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const updateImages = async () => {
      if (events.length > 0 && !updated) {
        const updatedEvents = await Promise.all(
          events.map(async (event) => {
            const eventimg = await firebase.getImageURL(event.image);
            console.log(eventimg);
            return { ...event, image: eventimg };
          })
        );
        setEvents(updatedEvents);
        setUpdated(true);
      }
    };
    updateImages();
  }, [events, updated, firebase]);

  useEffect(() => {
    const fetchData = async () => {
      const login = await firebase.isLogin;
      const loginStr = String(login);
      if (loginStr === "true") {
        const eventRef = await firebase.fetchEvents();
        if (eventRef) {
          onValue(eventRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const vals = Object.values(data);
              setEvents(vals);
              setUpdated(false);
            } else {
              setUpdated(true);
            }
          });
        }
      } else {
        navigate("/login", {
          state: { message: `Login to see your events.`, severity: "error" },
        });
      }
    };
    fetchData();
  }, [firebase,navigate]);

  function capitalizeFirstLetterOfEachWord(sentence) {
    return sentence
      .split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  function capitalizeFirstLetters(sentence) {
    let capitalized = "";
    let capitalizeNext = true;

    for (let i = 0; i < sentence.length; i++) {
      if (sentence[i] === ".") {
        capitalizeNext = true;
        capitalized += ".";
      } else if (sentence[i] !== " ") {
        if (capitalizeNext) {
          capitalized += sentence[i].toUpperCase();
          capitalizeNext = false;
        } else {
          capitalized += sentence[i];
        }
      } else {
        capitalized += sentence[i];
      }
    }

    return capitalized;
  }

  return (
    <div>
      {!updated ? (
        <div
          style={{
            position: "absolute",
            height: "80vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img height="100px" alt="loading" src={loading} />
        </div>
      ) : (
        <div>
          {events.length === 0 ? (
            <div className="centered-container">
              <img src={noEventFound} alt="No events found" />
              <h1>OOPS!!! No Events Found.</h1>
            </div>
          ) : (
            <div>
              <h1 style={{ textAlign: "center" }}>Your Events</h1>

              <div>
                {events.map((event) => {
                  return (
                    <div key={event.uid}>
                      <div
                        className="pet-container"
                        style={
                          isMobile
                            ? {
                                flexDirection: "column",
                                margin: "20px 5%",
                                position: "relative",
                              }
                            : {
                                flexDirection: "row",
                                margin: "20px 20%",
                                position: "relative",
                              }
                        }
                      >
                        <IconButton
                          aria-label="delete"
                          onClick={() => confirmDelete(event)}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            color: "#f44336",
                            borderRadius: "50%",
                            backgroundColor: "white",
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <img
                          alt={event.name}
                          src={event.image}
                          width="150px"
                          style={{
                            border: "2px solid gray",
                            borderRadius: "5px",
                            background: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => handleImageClick(event.image)}
                        />
                        <ul className="pet-details">
                          <li>
                            <span style={{ fontWeight: "bold" }}>Name</span> :{" "}
                            {capitalizeFirstLetterOfEachWord(event.name)}
                          </li>
                          <li>
                            <span style={{ fontWeight: "bold" }}>Category</span>{" "}
                            : {capitalizeFirstLetterOfEachWord(event.category)}
                          </li>
                          <li>
                            <span style={{ fontWeight: "bold" }}>Breed</span> :{" "}
                            {capitalizeFirstLetterOfEachWord(event.breed)}
                          </li>
                          <li>
                            <span style={{ fontWeight: "bold" }}>
                              Description
                            </span>{" "}
                            : {capitalizeFirstLetters(event.description)}
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <ThemeProvider theme={muitheme}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleClickOpen}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            backgroundColor: "grey",
            color: "white",
          }}
        >
          <AddIcon />
        </Fab>
      </ThemeProvider>
      <Dialog style={{ width: "100%" }} open={open} onClose={handleClose}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent sx={{ width: isMobile ? "70vw" : "30vw" }}>
          <div className="form-field">
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              autoComplete="eventname"
              type="text"
              fullWidth
              variant="standard"
              value={formValues.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          <div className="form-field">
            <TextField
              margin="dense"
              name="category"
              label="Category"
              autoComplete="category"
              type="text"
              fullWidth
              variant="standard"
              value={formValues.category}
              onChange={handleChange}
              required
            />
            {errors.category && (
              <div className="error-message">{errors.category}</div>
            )}
          </div>
          <div className="form-field">
            <TextField
              margin="dense"
              name="description"
              label="Description"
              autoComplete="description"
              type="text"
              fullWidth
              variant="standard"
              value={formValues.description}
              onChange={handleChange}
              required
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
          </div>
          <div className="form-field">
            <TextField
              margin="dense"
              name="breed"
              label="Breed"
              autoComplete="breed"
              type="text"
              fullWidth
              variant="standard"
              value={formValues.breed}
              onChange={handleChange}
              required
            />
            {errors.breed && (
              <div className="error-message">{errors.breed}</div>
            )}
          </div>
          <div className="form-field">
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{
                marginTop: "20px",
              }}
            >
              Upload Event Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleChange}
                name="image"
                required
              />
            </Button>
            {formValues.image && (
              <div className="file-name">{formValues.image.name}</div>
            )}
            {errors.image && (
              <div className="error-message">{errors.image}</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure, you want to remove {eventToDelete?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={handleImageDialogClose}>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Event"
            style={
              isMobile
                ? { width: "65vw", height: "auto" }
                : { width: "auto", height: "50vh" }
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
