const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");


dotenv.config();

const predefinedAdminEmail = process.env.ADMIN_EMAIL;
const resetLink = process.env.RESETLINK;


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});


// Login function for both users and admin
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const tokenPayload = {
      id: user._id,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: ` ${user.isAdmin ? "Admin" : "User"} logged in successfully`,
      token,
      isAdmin: user.isAdmin,  
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};


// User registration function

const createUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("User Email:", email);

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      isAdmin: email.toLowerCase() === predefinedAdminEmail.toLowerCase(),
    });

    console.log("Is Admin:", newUser.isAdmin);

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
};


// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 

    if (!users) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Error retrieving users" });
  }
};



const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user profile" });
  }
};

// Get admin dashboard 
const adminDashboard = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      res.status(200).json({ message: " Welcome to the admin dashboard" });
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error accessing admin dashboard" });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const username = email.split('@')[0];
  const emailPath = path.join(__dirname, '../client/emailReset.html');
  const emailTemplate = fs.readFileSync(emailPath, 'utf-8');

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate and hash reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${resetLink}/authentication/reset/${resetToken}`;
    const personalizedTemplate = emailTemplate
      .replace('{{username}}', username)
      .replace('{{resetUrl}}', resetUrl);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: personalizedTemplate,
    };
    
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Error requesting password reset" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  console.log(newPassword, token);
  try {
    const resetTokenHashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10); 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
};



// Delete user 
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the user is not an admin before deleting
    if (user.isAdmin) {
      return res.status(403).json({ error: "You are not allowed to delete an admin" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};


module.exports = {
  login,
  getUsers, 
  deleteUser,
  createUser,
  userProfile,
  adminDashboard,
  requestPasswordReset,
  resetPassword,
};
