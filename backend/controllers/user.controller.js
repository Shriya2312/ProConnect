import Profile from '../models/profile.model.js';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import Comment from '../models/comments.model.js';
import Post from '../models/posts.model.js';
import Connection from "../models/connection.model.js";

const convertUserDataToPDF = (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(16).toString('hex') + '.pdf';
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);
  doc.image(`Uploads/${userData.userId.profilePicture}`, { align: 'center', width: 100 });
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.text(`Email: ${userData.userId.email}`);
  doc.text(`Username: ${userData.userId.username}`);
  doc.text(`Bio: ${userData.bio || 'No bio available'}`);
  doc.text(`Current Position: ${userData.currentPost || 'No position available'}`);
  doc.text(`Past Work:`);
  userData.pastWork.forEach((work) => {
    doc.fontSize(14).text(`Company Name: ${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });
  doc.end();
  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    console.log("Registering user with data:", req.body);
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, username });
    await newUser.save();
    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    res.json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Logging in user with data:", req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist with this email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = crypto.randomBytes(32).toString('hex');
    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    return res.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser && String(existingUser._id) !== String(user._id)) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      'userId',
      'name email username profilePicture'
    );
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    console.log("Returning profile:", userProfile);
    res.json(userProfile);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    console.log("Received /update_user_profile request");
    const { token, ...newProfileData } = req.body;
    console.log("Request body:", req.body);
    if (!token) {
      console.log("Token missing");
      return res.status(401).json({ message: "Token missing" });
    }
    console.log("Querying user with token:", token);
    const user = await User.findOne({ token });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Querying profile for userId:", user._id);
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      console.log("Profile not found");
      return res.status(404).json({ message: "Profile not found" });
    }
    console.log("Updating profile with data:", newProfileData);
    if (newProfileData.bio !== undefined) profile.bio = newProfileData.bio;
    if (newProfileData.currentPost !== undefined) profile.currentPost = newProfileData.currentPost;
    if (newProfileData.pastWork !== undefined) profile.pastWork = newProfileData.pastWork;
    if (newProfileData.education !== undefined) profile.education = newProfileData.education;
    console.log("Saving profile...");
    const updatedProfile = await profile.save();
    console.log("Profile saved:", updatedProfile);
    return res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("❌ Error updating profile:", error.stack);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllUsersProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'name email username profilePicture');
    console.log("Fetched Profiles Count:", profiles.length);
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    'userId',
    'name email username profilePicture'
  );
  let outputPath = await convertUserDataToPDF(userProfile);
  return res.json({ message: outputPath });
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }
    const existingRequest = await Connection.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already sent" });
    }
    const request = new Connection({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await request.save();
    return res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getMyConnectionsRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await Connection.find({ userId: user._id }).populate(
      'connectionId',
      'name email username profilePicture'
    );
    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const myConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await Connection.find({ connectionId: user._id }).populate(
      'userId',
      'name email username profilePicture'
    );
    if (!connections || connections.length === 0) {
      return res.status(404).json({ message: "No connections found" });
    }
    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = await Connection.findOne({ _id: requestId });
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();
    return res.json({ message: "Request updated" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,
    });
    await comment.save();
    res.status(200).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Error commenting on post:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      'userId',
      'name username email profilePicture'
    );
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};