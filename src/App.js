import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FillProfile from "./pages/FillProfile";
import MyPets from "./pages/MyPets";
import ShowProfile from "./pages/ShowProfile";
import MyEvents from "./pages/MyEvents";
import AllEvents from "./pages/AllEvents";
import Location from "./pages/Location";
import PhoneNumberVerification from "./pages/PhoneNumberVerification";
// import MapBoxDele from "./pages/MapBoxDele";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/allevents" element={<AllEvents />} />
        <Route path="/mypets" element={<MyPets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fillprofile" element={<FillProfile />} />
        <Route path="/myevents" element={<MyEvents />} />
        <Route path="/location" element={<Location />} />
        {/* <Route path="/mapbox" element={<MapBoxDele />} /> */}
        <Route path="/users/:uid" element={<ShowProfile />} />
     
          <Route
            path="/verify-phone"
            element={<PhoneNumberVerification />}
          />
     
      </Routes>
    </div>
  );
}

export default App;
