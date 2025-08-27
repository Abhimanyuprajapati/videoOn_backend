import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  // res.send("Signup Route");
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exits, Please try different email" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate 1 to 100 random number
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });

    // create the user in the stream
    try{
      await upsertStreamUser({
        id: newUser._id.toString(),
         name: newUser.fullName,
        image: newUser.profilePic || "",
      })
      console.log("Stream user upserted successfully");
    } catch (error){
      console.error("Error upserting Stream user:", error);
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "Strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    // check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }
    // check if user not found
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "Strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
}

export async function onboard(req, res){
console.log("onboarding", req.user);
try{
const userId = req.user._id;

const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;
if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
  return res.status(400).json({ message: "All fields are required",
     missingFields: [
      !fullName && "fullName",
      !bio && "bio",    
      !nativeLanguage && "nativeLanguage",
      !learningLanguage && "learningLanguage",
      !location && "location"
    ].filter(Boolean) // Filter out undefined values
   });
}

const updatedUser = await User.findByIdAndUpdate(userId, {
  ...req.body,
  isOnBoarded: true,
}, {new: true})

if(!updatedUser) {
  return res.status(404).json({ message: "User not found" });
}

try{
await upsertStreamUser({
    id: updatedUser._id.toString(),
    name: updatedUser.fullName,
    image: updatedUser.profilePic || "",
  });
  console.log("Stream user updated successfully");
}catch (error) {
  console.error("Error updating Stream user during onboarding:", error);
}

res.status(200).json({success: true, user: updatedUser, message: "Onboarding completed successfully"})

}catch (error) {
  console.error("Error in onboarding:", error);
  res.status(500).json({ message: "Internal server error" });
}
}
