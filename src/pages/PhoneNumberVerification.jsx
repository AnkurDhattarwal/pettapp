import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useFirebase } from "../context/Firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function PhoneNumberVerification() {
  const firebase = useFirebase();
  const auth = firebase.firebaseAuth;
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const sendOtp = async () => {
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
      const confirmation_ = await signInWithPhoneNumber(auth, phone, recaptcha);
      setConfirmation(confirmation_);
    } catch (err) {
      console.log(err);
    }
  };

  const verifyOtp = async () => {
    try {
      const conf = await confirmation.confirm(otp);
      console.log(conf);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <PhoneInput
        country={"in"}
        value={phone}
        onChange={(phone) => setPhone("+" + phone)}
      />
      <div id="recaptcha"></div>
      <Button onClick={sendOtp} variant="outlined">
        Send OTP
      </Button>
      <TextField
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        variant="outlined"
        size="small"
        label="Enter OTP"
      />
      <Button onClick={verifyOtp} variant="outlined">
        Verify OTP
      </Button>
    </div>
  );
}

export default PhoneNumberVerification;
