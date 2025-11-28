
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: "Admin already exists" });

    const admin = new Admin({ name, email, password });
    await admin.save();

    res.json({ message: "Admin signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid email" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({ message: "Admin login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
