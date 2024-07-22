import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Avatar,
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { onValue } from "firebase/database";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import { useFirebase } from "../context/Firebase";
import noPetFound from "../Images/noPetFound.png";
import loading from '../Images/loading.gif';

export default function ShowProfile() {
  const firebase = useFirebase();
  const params = useParams();
  const theme = useTheme();
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    title: "",
    description: "",
    profileImage: "",
  });
  const [pets, setPets] = useState([]);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updated, setUpdated] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleImageDialogOpen = () => {
    setOpenImageDialog(true);
  };
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };
    const handleImageClose = (image) => {
    setSelectedImage(null);
    setImageDialogOpen(false);
  };

  const handleImageDialogClose = () => {
    setOpenImageDialog(false);
  };

  useEffect(() => {
    const updateImages = async () => {
      if (pets.length > 0 && !updated) {
        const updatedPets = await Promise.all(
          pets.map(async (pet) => {
            const petimg = await firebase.getImageURL(pet.image);
            return { ...pet, image: petimg };
          })
        );
        setPets(updatedPets);
        setUpdated(true);
      }
    };

    updateImages();
  }, [pets, updated, firebase]);

  useEffect(() => {
    const fetchData = async () => {
      const userRef = await firebase.getUserByID(params.uid);
      if (userRef) {
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const profileImg = await firebase.getImageURL(data.profileImage);
            setProfileDetails({
              name: data.username,
              title: data.title,
              description: data.description,
              profileImage: profileImg,
            });
            if (data.pets) {
              const vals = Object.values(data.pets);
              setPets(vals);
              setUpdated(false);
            }
            else{
              setUpdated(true)
            }
          }
        });
      }
    };

    fetchData();
  }, [firebase, params.uid]);

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
    <Container style={{ marginTop: "15px" ,position:'relative'}}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        style={{ marginBottom: "1rem" }}
      >
        <Grid item>
          <Avatar
            style={{ border: "3px solid" }}
            src={profileDetails.profileImage}
            sx={{ width: 150, height: 150, cursor: "pointer" }}
            onClick={handleImageDialogOpen}
          />
        </Grid>
        <Grid item>
          <Box>
            <Typography
              variant="h5"
              style={{ fontWeight: "bold" }}
              component="div"
            >
              {profileDetails.name}
            </Typography>
            <Typography
              variant="body1"
              style={{ fontWeight: "bold" }}
              component="div"
            >
              {profileDetails.title}
            </Typography>
            <Typography variant="body2" component="div">
              {profileDetails.description}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <hr />
      <Dialog open={openImageDialog} onClose={handleImageDialogClose}>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleImageDialogClose}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img
            alt="Profile"
            src={profileDetails.profileImage}
            style={
              isMobile
                ? { width: "65vw", height: "auto" }
                : { width: "auto", height: "50vh" }
            }
          />
        </DialogContent>
      </Dialog>
      {!updated ? (
        <div
          style={{
            position: "absolute",
            height: "80%",
            width: "90%",
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
          {pets.length === 0 ? (
            <div className="centered-container">
              <img src={noPetFound} alt="No pets found" />
              <h1>OOPS!!! No Pets Found.</h1>
            </div>
          ) : (
            <div>
              <h1 style={{ textAlign: "center" }}>Pets</h1>
              <div>
                {updated &&
                  pets.map((pet) => {
                    return (
                      <div key={pet.uid}>
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
                          <img
                            alt={pet.name}
                            src={pet.image}
                            width="150px"
                            style={{
                              border: "2px solid gray",
                              borderRadius: "5px",
                              background: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleImageClick(pet.image)}
                          />
                          <ul className="pet-details">
                            <li>
                              <span style={{ fontWeight: "bold" }}>Name</span> :{" "}
                              {capitalizeFirstLetterOfEachWord(pet.name)}
                            </li>
                            <li>
                              <span style={{ fontWeight: "bold" }}>
                                Category
                              </span>{" "}
                              : {capitalizeFirstLetterOfEachWord(pet.category)}
                            </li>
                            <li>
                              <span style={{ fontWeight: "bold" }}>Breed</span>{" "}
                              : {capitalizeFirstLetterOfEachWord(pet.breed)}
                            </li>
                            <li>
                              <span style={{ fontWeight: "bold" }}>
                                Description
                              </span>{" "}
                              : {capitalizeFirstLetters(pet.description)}
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
      <Dialog open={imageDialogOpen} onClose={handleImageClose}>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Pet"
            style={
              isMobile
                ? { width: "65vw", height: "auto" }
                : { width: "auto", height: "50vh" }
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
