import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateReferralCode = (id) => {
  const timestamp = Date.now(); 
  return `${id}-${timestamp}`;
};

export const signup = async (req, res) => {
  const { name, email, phone, address, password, referalCode } = req.body;

  if (!name || !email || !phone || !address || !password)
    return res.status(400).json({ msg: "All fields are required" });
  console.log(`referalCode: ${referalCode}`);
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });
    const token = jwt.sign({ id: phone }, "2346789", {
      expiresIn: "7d",
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const MyreferalCode = generateReferralCode(JSON.stringify(phone));

    user = new User({
      name,
      email,
      phone,
      address,
      token,
      password: hashedPassword,
      MyreferalCode,
    });

    await user.save();

    res.status(201).json({
      msg: "User registered",
      user: { name, email, phone, address, referalCode },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.phone }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        referalCode: user.referalCode,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-__v");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res
      .status(200)
      .json({ msg: "User deleted successfully", deletedUser: user });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};
