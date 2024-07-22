import React, { useState, useEffect } from "react";
import { onValue } from "firebase/database";
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
  TextField,
  Button,
  Fab,
  DialogActions,
  Card,
  CardMedia,
  Divider,
} from "@mui/material";

import "../css/MyPets.css";
import noPetFound from "../Images/noPetFound.png";
import Favorite from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import loading from "../Images/loading.gif";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function Profile() {
  const theme = useTheme();
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    title: "",
    description: "",
    profileImage: "",
  });

  const [posts, setPosts] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(null);
  const [currentUid, setCurrentUid] = useState(null);
  const [currentCaption, setCurrentCaption] = useState(null);
  const [currentLikes, setCurrentLikes] = useState(null);

  const [newPost, setNewPost] = useState({
    image: "",
    caption: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({
    image: "",
    caption: "",
  });

  const firebase = useFirebase();
  const navigate = useNavigate();

  const handleImageDialogOpen = () => {
    setOpenImageDialog(true);
  };

  const handleImageDialogClose = () => {
    setOpenImageDialog(false);
  };

  const handleEditDialogOpen = () => {
    setOpenEditDialog(true);
  };

  const closeEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditDialogClose = async () => {
    setOpenEditDialog(false);
    await firebase.updateProfileDetails(
      profileDetails.name.toUpperCase(),
      profileDetails.title,
      profileDetails.description
    );
  };

  const handlePostDialogOpen = () => {
    setOpenPostDialog(true);
  };

  const handlePostDialogClose = () => {
    setOpenPostDialog(false);
    setNewPost({
      image: "",
      caption: "",
    });
    setSelectedFile(null);
    setErrors({
      image: "",
      caption: "",
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setErrors((prevErrors) => ({ ...prevErrors, image: "" }));
    }
  };

  const handleAddPost = async () => {
    let hasError = false;
    if (!selectedFile) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        image: "Please select an image.",
      }));
      hasError = true;
    }
    if (!newPost.caption) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        caption: "Please add a caption.",
      }));
      hasError = true;
    }
    setTimeout(() => {
      setErrors({ image: "", caption: "" });
    }, 3000);
    if (hasError) return;

    const postDetails = {
      image: selectedFile,
      caption: newPost.caption,
    };

    await firebase.updatePosts(postDetails.image, postDetails.caption);
    handlePostDialogClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      const login = await firebase.isLogin;
      const loginStr = String(login);
      if (loginStr === "true") {
        const postsRef = await firebase.fetchPosts();
        if (postsRef) {
          onValue(postsRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const vals = Object.values(data);
              setPosts(vals);
              setUpdated(false);
            } else {
              setUpdated(true);
            }
          });
        }
      }
    };
    fetchData();
  }, [firebase]);
  useEffect(() => {
    const updateImages = async () => {
      if (posts.length > 0 && !updated) {
        const updatedPosts = await Promise.all(
          posts.map(async (post) => {
            const postimg = await firebase.getImageURL(post.image);
            console.log(postimg);
            return { ...post, image: postimg };
          })
        );
        setPosts(updatedPosts);
        setUpdated(true);
      }
    };
    updateImages();
  }, [posts, updated, firebase]);

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
    const fetchData = async () => {
      const userRef = await firebase.getUserData();
      if (userRef) {
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          console.log(data);
          if (!data) {
            navigate("/fillprofile");
          } else {
            const profileImg = await firebase.getImageURL(data.profileImage);
            setProfileDetails({
              name: data.username,
              title: data.title,
              description: data.description,
              profileImage: profileImg,
            });
          }
        });
      }
    };
    fetchData();
  }, [firebase, navigate]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await firebase.updateProfileImage(file);
      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        profileImage: imageUrl,
      }));
      handleImageDialogClose();
    }
  };

  const handlePostOpen = (img, caption, uid, likes) => {
    setCurrentCaption(caption);
    setCurrentUid(uid);
    setCurrentImg(img);
    setCurrentLikes(likes);

    setPostOpen(true);
  };
  const handlePostClose = () => {
    setCurrentUid(null);
    setCurrentCaption(null);
    setCurrentImg(null);
    setCurrentLikes(null);

    setPostOpen(false);
  };

  const handleDeletePost = async (postUid) => {
    await firebase.deletePost(postUid);
    setCurrentUid(null);
    setCurrentCaption(null);
    setCurrentImg(null);
    setCurrentLikes(null);
    setPosts((prevPosts) => prevPosts.filter((post) => post.uid !== postUid));
    setPostOpen(false);
  };

  return (
    <Container style={{ marginTop: "15px", position: "relative" }}>
      <Fab
        aria-label="edit"
        onClick={handleEditDialogOpen}
        size="small"
        style={{
          position: "absolute",
          top: "15px",
          right: "30px",
          borderRadius: "50%",
          backgroundColor: "white",
        }}
      >
        <EditIcon />
      </Fab>
      <Grid container spacing={2} alignItems="center">
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

      {/* Image Dialog */}
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
        <hr style={{ border: "1px solid #ccc", width: "90%" }} />
        <DialogActions>
          <Button
            variant="outlined"
            component="label"
            color="error"
            style={{ border: "2px solid", fontWeight: "bold", margin: "auto" }}
          >
            Upload New Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post dialog */}
      <Dialog open={postOpen} onClose={handlePostClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handlePostClose}
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
        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: isMobile ? "100%" : "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                alt="Post"
                src={currentImg}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Divider
              orientation={isMobile ? "horizontal" : "vertical"}
              flexItem
              sx={{
                margin: isMobile ? "16px 0" : "0 16px",
                borderColor: "#ccc",
              }}
            />
            <Box
              sx={{
                width: isMobile ? "100%" : "50%",
                padding: isMobile ? "16px 0" : "0 16px",
              }}
            >
              <Typography
                sx={{ color: "gray", fontStyle: "italic" }}
                variant="body2"
              >
                — {currentCaption}
              </Typography>
              <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Favorite sx={{ color: "#f44336" ,marginRight:'5px'}} />
                <span variant="h5">{currentLikes}</span>
              </div>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            component="label"
            color="error"
            style={{ border: "2px solid", fontWeight: "bold", margin: "auto" }}
            onClick={() => handleDeletePost(currentUid)}
          >
            Delete Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={closeEditDialog}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            autoComplete="name"
            fullWidth
            variant="standard"
            value={profileDetails.name}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            name="title"
            label="Title"
            autoComplete="title"
            type="text"
            fullWidth
            variant="standard"
            value={profileDetails.title}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            autoComplete="description"
            type="text"
            fullWidth
            variant="standard"
            value={profileDetails.description}
            onChange={handleProfileChange}
          />
          <Button
            style={{ border: "1px solid", padding: "1px" }}
            onClick={handleEditDialogClose}
            color="primary"
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <hr style={{ border: "1px solid #ccc", margin: "20px 0" }} />

      {/* Posts Section */}
      <Typography variant="h6" gutterBottom>
        Posts
      </Typography>
      {!updated ? (
        <div className="centered-container-temp">
          <img alt="loading" height="100px" src={loading} />
        </div>
      ) : (
        <div>
          {posts.length === 0 ? (
            <div className="centered-container">
              <img src={noPetFound} alt="No pets found" />
              <h1>OOPS!!! No Posts Found.</h1>
            </div>
          ) : (
            <Grid container spacing={1}>
              {posts.map((post, index) => (
                <Grid item xs={4} sm={4} md={3} key={index}>
                  <Card
                    sx={{
                      height: {
                        xs: "100px",
                        sm: "200px",
                        md: "270px",
                      },
                      display: "flex",
                      flexDirection: "column",
                      border: "3px solid",
                      position: "relative",
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        height: {
                          xs: "100px",
                          sm: "200px",
                          md: "270px",
                        },
                        objectFit: "contain",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                      image={post.image}
                      alt="Post Image"
                      onClick={() =>
                        handlePostOpen(
                          post.image,
                          post.caption,
                          post.uid,
                          post.likes
                        )
                      }
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      )}

      {/* Add Post Dialog */}
      <Dialog open={openPostDialog} onClose={handlePostDialogClose}>
        <DialogTitle style={{ margin: "auto" }}>Add New Post</DialogTitle>
        <DialogContent>
          {" "}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              component="label"
              color="primary"
              style={{
                border: "2px solid",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
            {errors.image && (
              <Typography variant="body2" color="error" gutterBottom>
                {errors.image}
              </Typography>
            )}
            {selectedFile && (
              <img
                alt="New post"
                src={URL.createObjectURL(selectedFile)}
                style={
                  isMobile
                    ? { width: "65vw", height: "auto" }
                    : { width: "auto", height: "50vh" }
                }
              />
            )}
          </div>
          <TextField
            margin="dense"
            name="caption"
            label="Caption"
            type="text"
            fullWidth
            variant="standard"
            value={newPost.caption}
            onChange={handlePostChange}
          />
          {errors.caption && (
            <Typography variant="body2" color="error" gutterBottom>
              {errors.caption}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddPost} color="primary">
            Add Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <ThemeProvider theme={muitheme}>
        <Fab
          aria-label="add"
          onClick={handlePostDialogOpen}
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
    </Container>
  );
}
