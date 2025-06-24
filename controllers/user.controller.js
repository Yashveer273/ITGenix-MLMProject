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
    const MyreferalCode = generateReferralCode(phone);

    user = new User({
      name,
      email,
      phone,
      id: phone,
      address,
      token,
      password: hashedPassword,
      MyreferalCode,
    });

    await user.save();

    res.status(201).json({
      msg: "User registered",
      user: { name, email, id: phone, address, MyreferalCode },
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
        id: user.phone,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        referalCode: user.MyreferalCode,
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

export const ref15 = async (req, res) => {
  const { reffCode, amount, my_id } = req.body;

  if (!reffCode || !amount || !my_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const earnAmt = Number(amount) * 0.15;

  try {
    const user = await User.findOne({ MyreferalCode: reffCode });

    if (!user) {
      return res.status(404).json({ error: "Referrer not found" });
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);
    // Check if today's earning date entry exists

    const dateExists = user.today_earning.find((entry) => entry.date === date);

    if (dateExists) {
      await User.updateOne(
        { MyreferalCode: reffCode, "today_earning.date": date },
        {
          $push: {
            "today_earning.$.records": {
              time,
              amount: earnAmt,
              from_id: my_id,
            },
          },
        }
      );
    } else {
      await User.updateOne(
        { MyreferalCode: reffCode },
        {
          $push: {
            today_earning: {
              date,
              records: [
                {
                  time,
                  amount: earnAmt,
                  from_id: my_id,
                },
              ],
            },
          },
        }
      );
    }

    return res.json({
      success: true,
      message: "Referral earning added",
      add15to: reffCode,

      added: earnAmt,
      date,
    });
  } catch (err) {
    console.error("Error updating earnings:", err);
    res.status(500).json({ error: "Server error" });
  }
};
