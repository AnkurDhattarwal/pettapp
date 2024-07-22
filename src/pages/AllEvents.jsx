import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { get, child, ref ,update} from "firebase/database";
import { useTheme, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import loaderGif from "../Images/loading.gif";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const PAGE_SIZE = isMobile ? 6 : 4;
  const [posts, setPosts] = useState([]);
  const firebase = useFirebase();
  const firebaseAuth = firebase.firebaseAuth;

  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [user, setUser] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const firestore = firebase.firestore;
  const db = firebase.db;
  const dbRef = ref(db);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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


  const handleExpandClick = (postId) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [postId]: !prevExpanded[postId],
    }));
  };

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      user ? setUser(user) : setUser(null);
    });
    console.log(user);
    if (user !== "") fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
      if (lastDoc) {
        q = query(
          collection(firestore, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      const snapshot = await getDocs(q);

      const newPosts = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const imgurl = await firebase.getImageURL(doc.data().image);
          // console.log(db);
          const snap = await get(child(dbRef, `users/${doc.data().userid}`));
          const profileImage = await firebase.getImageURL(
            snap.val().profileImage
          );
          const now = new Date(doc.data().createdAt);
          const day = now.getDate();
          const year = now.getFullYear();
          const month = monthNames[now.getMonth()];
          const fullDate = `${month} ${day}, ${year}`;
          const me = doc.data().usersLike[user.uid] ? true : false;
          console.log(me);
          return {
            username: snap.val().username,
            profileImage,
            id: doc.id,
            fullDate,
            me,
            imgurl,
            ...doc.data(),
          };
        })
      );

      setPosts((prevPosts) => {
        const postIds = new Set(prevPosts.map((post) => post.id));
        const filteredNewPosts = newPosts.filter(
          (post) => !postIds.has(post.id)
        );
        return [...prevPosts, ...filteredNewPosts];
      });

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(newLastDoc);

      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateProfile = (id) => {
    navigate(`/users/${id}`);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      loading ||
      !hasMore
    ) {
      return;
    }
    fetchData();
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore]);

  const handleLikes = async (postGiven) => {
    const postRef = doc(firebase.firestore, "posts", postGiven.id);
    if (postGiven.me) {
      setPosts((prevposts) =>
        prevposts.map((post) => {
          if (post.id === postGiven.id) {
            const updatedUsersLike = {
              ...post.usersLike,
              [user.uid]: undefined,
            };
            const likes = post.likes - 1;
            return {
              ...post,
              me: !post.me,
              likes,
              usersLike: updatedUsersLike,
            };
          } else return post;
        })
      );
      const updates = {
        [`/users/${postGiven.userid}/posts/${postGiven.uid}/likes`]:
          postGiven.likes - 1,
        [`/users/${postGiven.userid}/posts/${postGiven.uid}/usersLike/${user.uid}`]: false,
      };
      await update(ref(db), updates);

      await updateDoc(postRef, {
        usersLike: {
          ...postGiven.usersLike,
          [user.uid]: false,
        },
        likes: postGiven.likes - 1,
      });
    } else {
      setPosts((prevposts) =>
        prevposts.map((post) => {
          if (post.id === postGiven.id) {
            const updatedUsersLike = { ...post.usersLike, [user.uid]: true };

            const likes = post.likes + 1;
            return {
              ...post,
              me: !post.me,
              likes,
              usersLike: updatedUsersLike,
            };
          } else return post;
        })
      );
      const updates = {
        [`/users/${postGiven.userid}/posts/${postGiven.uid}/likes`]:
          postGiven.likes + 1,
        [`/users/${postGiven.userid}/posts/${postGiven.uid}/usersLike/${user.uid}`]: true,
      };
      await update(ref(db), updates);
      await updateDoc(postRef, {
        usersLike: {
          ...postGiven.usersLike,
          [user.uid]: true,
        },
        likes: postGiven.likes + 1,
      });
    }
  };

  return (
    <div
      style={{
        width: "calc(100% - 8px)",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      {posts.map((post) => (
        <div key={post.id}>
          <Card
            sx={{
              maxWidth: 345,
              marginTop: "25px",
              backgroundColor: "#ebebeb",
              width: "300px",
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  sx={{ border: "2px solid black" }}
                  aria-label="recipe"
                  src={post.profileImage}
                  onClick={() => handleNavigateProfile(post.userid)}
                />
              }
              title={post.username}
              subheader={post.fullDate}
            />
            <CardMedia
              component="img"
              width="100%"
              image={post.imgurl}
              alt="loading"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {post.caption}
              </Typography>
            </CardContent>
            <CardActions disableSpacing>
              <IconButton
                aria-label="add to favorites"
                onClick={() => handleLikes(post)}
              >
                {post.me ? (
                  <FavoriteIcon sx={{ color: red[500] }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: red[500] }} />
                )}
              </IconButton>
              <Typography>{post.likes}</Typography>
              {console.log(post)}
              <ExpandMore
                expand={expanded[post.id]}
                onClick={() => handleExpandClick(post.id)}
                aria-expanded={expanded[post.id]}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
            <Collapse in={expanded[post.id]} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography paragraph>{post.caption}</Typography>
              </CardContent>
            </Collapse>
          </Card>{" "}
        </div>
      ))}

      {loading && (
        <div
          style={{
            position: "fixed",
            height: "80vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img height="100px" alt="loading" src={loaderGif} />
        </div>
      )}
      {!hasMore && <h1>No more posts</h1>}
    </div>
  );
}

export default Home;
