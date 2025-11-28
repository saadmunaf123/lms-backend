
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Provider = require("../models/Provider");
const CourseChapter = require("../models/CourseChapter");

exports.providerSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Provider.findOne({ email });
    if (exists) return res.status(400).json({ error: "Provider already exists" });

    const provider = new Provider({ name, email, password });
    await provider.save();

    res.json({ message: "Provider signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

exports.providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const provider = await Provider.findOne({ email });
    if (!provider) return res.status(400).json({ error: "Invalid email" });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: provider._id, role: "provider" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Provider login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find().select("-password");
    res.json({providers});
    } catch (err) {
    res.status(500).json({ error: "Failed to fetch providers" });
    }
};

exports.getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id).select("-password");
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider" });
  }
};

exports.deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findByIdAndDelete(id);
        if (!provider) return res.status(404).json({ error: "Provider not found" });
        res.json({ message: "Provider deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete provider" });
    }
};

exports.getMyProfile = async (req, res) => {
  try{
    const provider = await Provider.findById(req.user._id).select("-password");
    if(!provider) return res.status(404).json({ error: "Provider not found"});
    res.json(provider);
  }catch(err){
    res.status(500).json({error: "Failed to fetch profile"});
  }
};
