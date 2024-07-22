import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import PetsIcon from "@mui/icons-material/Pets";
import { useFirebase } from "../context/Firebase";
import { onValue } from "firebase/database";
import { ListItemAvatar } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import { debounce } from "lodash";

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [width, setWidth] = useState(window.innerWidth);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const firebase = useFirebase();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [pages, setPages] = useState(["Home", "All Events"]);
  const [settings, setSettings] = useState([
    "Login",
    "Signup",
    "Profile",
    "Account",
    "Dashboard",
  ]);

  useEffect(() => {
    const confirmFunn = async () => {
      const confirm = await firebase.isLogin;
      const confirmString = String(confirm);
      if (confirmString === "true") {
        setSettings(["Profile", "Account", "Dashboard", "Logout"]);
        if (localStorage.getItem("loginMode") === "pet owner") {
          setPages(["Home", "My Pets", "All Events"]);
        } else if (localStorage.getItem("loginMode") === "organiser") {
          setPages(["Home", "My Events", "All Events"]);
        } else if (
          localStorage.getItem("loginMode") === "medical professional"
        ) {
          setPages(["Home", "Awards/Qualifications", "All Events"]);
        }
      } else {
        setSettings(["Login", "Signup", "Profile", "Account", "Dashboard"]);
        setPages(["Home", "All Events"]);
      }
    };
    confirmFunn();
  }, [firebase]);

  useEffect(() => {
    const confirmFunn = async () => {
      const confirm = await firebase.isLogin;
      const confirmString = String(confirm);
      if (confirmString === "false") {
        setProfileImage("");
      } else {
      }
    };
    confirmFunn();
  }, [firebase]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = async (path) => {
    handleCloseNavMenu();
    handleCloseUserMenu();
    if (path === "/logout") {
      await firebase.logout();
      localStorage.removeItem("loginMode");
      navigate("/login", {
        state: { message: `Logout Successful.`, severity: "success" },
      });
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userRef = await firebase.getUserData();
      if (userRef) {
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          console.log(data);
          if (!data) {
          } else {
            const profileImg = await firebase.getImageURL(data.profileImage);
            setProfileImage(profileImg);
          }
        });
      }
    };
    fetchData();
  }, [firebase]);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Use debounce to limit the number of search calls
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 1) {
        const results = await firebase.searchUsers(query.toUpperCase());
        const resultsWithImages = await Promise.all(
          results.map(async (user) => {
            const imageUrl = await firebase.getImageURL(user.profileImage);
            return { ...user, imageUrl };
          })
        );
        setSearchResults(resultsWithImages);
      } else {
        setSearchResults([]);
      }
    }, 300),
    [firebase]
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", color: "black" }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <PetsIcon
              sx={{
                display: { xs: "none", md: "flex" },
                mr: 1,
                color: "black",
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/home"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              PETT
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon sx={{ color: "black" }} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page}
                    onClick={() =>
                      handleMenuItemClick(
                        `/${page.toLowerCase().replace(" ", "")}`
                      )
                    }
                  >
                    <Typography textAlign="center" sx={{ color: "black" }}>
                      {page}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <PetsIcon
              sx={{
                display: { xs: "flex", md: "none" },
                mr: 1,
                color: "black",
              }}
            />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/home"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              PETT
            </Typography>
            {width < 900 ? (
              <Button
                variant="outlined"
                color="primary"
                style={{ marginRight: "5%", color: "black" }}
                onClick={handleSearchOpen}
              >
                <SearchIcon />
              </Button>
            ) : null}

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() =>
                    handleMenuItemClick(
                      `/${page.toLowerCase().replace(" ", "")}`
                    )
                  }
                  sx={{ my: 2, color: "black", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>
            {width >= 900 ? (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SearchIcon />}
                style={{ marginRight: "10%", color: "black" }}
                onClick={handleSearchOpen}
              >
                Search...
              </Button>
            ) : null}

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar style={{ border: "2px solid " }} src={profileImage} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() =>
                      handleMenuItemClick(`/${setting.toLowerCase()}`)
                    }
                  >
                    <Typography textAlign="center" sx={{ color: "black" }}>
                      {setting}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Dialog
        PaperProps={
          isMobile
            ? { style: { marginBottom: "70%" } }
            : { style: { marginBottom: "30%" } }
        }
        open={searchOpen}
        onClose={handleSearchClose}
      >
        <DialogContent>
          <DialogContentText>
            Enter the name of the user you are looking for.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Search Users"
            type="text"
            fullWidth
            variant="standard"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <List>
            {searchResults.map((user) => (
              <Button
                style={{
                  color: "black",
                  padding: "0px",
                  width: "100%",
                  textTransform: "none",
                }}
                onClick={() => {
                  navigate(`/users/${user.id}`);
                  handleSearchClose();
                }}
                key={user.id}
              >
                <ListItem style={{ padding: "3px" }}>
                  <ListItemAvatar>
                    <Avatar
                      style={{ border: "2px solid" }}
                      src={user.imageUrl}
                      alt={user.username}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                </ListItem>
              </Button>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
