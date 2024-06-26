const express = require("express");
const registrationRoute = express.Router();
const bcrypt = require("bcrypt");

// const { encodePassword } = require("../middlewares/index.js");
const User = require("../models/userModel.js");

registrationRoute.post("/register-route", async (req, res) => {
  try {
    const user = req.body;

    let errorMessage = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    switch (true) {
      case user.name === "":
        errorMessage = "Name is required";
        break;
      case user.name.length<3:
        errorMessage = "Name should be atleast 3 characters long";
        break;
      case !nameRegex.test(user.name):
        errorMessage =
          "Invalid name format. Only letters and spaces are allowed";
        break;
      case user.email === "":
        errorMessage = "Email is required";
        break;
      case !emailRegex.test(user.email):
        errorMessage = "Invalid email format";
        break;
      case user.password === "":
        errorMessage = "Password is required";
        break;
      case user.password.length<4:
        errorMessage = "Password should be atleast 4 characters long";
        break;
      case user.c_password === "":
        errorMessage = "Confirm password is required";
        break;
      case user.password !== user.c_password:
        errorMessage = "Password and confirm password should be the same";
        break;
    }

    if (errorMessage) {
      return res.status(400).send({
        message: errorMessage,
      });
    }

    const userDb = await User.findOne({ email: user.email });

    if (userDb) {
      return res.status(400).send({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(user.password, salt);

    // const phoneLength = user.phone_number.length;
    // // console.log(`Phone number length: ${phoneLength}`);

    // if (phoneLength !== 10) {
    //   return res.status(400).send({
    //     message: "Phone number should be 10 digits long",
    //   });
    // }

    // const updated_user = {
    //   full_name: `${user.first_name} ${user.last_name}`,
    //   email: user.email,
    //   phone_number: user.phone_number,
    //   address: `${user.city} ${user.state} ${user.pincode}`,
    //   class: `${user.semester} ${user.course} ${user.college}`,
    //   semester: user.semester,
    //   password: hashed_password,
    // };

    const newUser = new User({
      full_name: user.name,
      email: user.email,
      password: hashed_password,
    });
    await newUser.save();

    res.status(201).send({
      message: "Registration successful",
      user: newUser,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

module.exports = registrationRoute;
