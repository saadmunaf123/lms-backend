const express = require("express");
const Sample = require("../models/Sample");
const router = express.Router();

// Add user
router.post("/add", async (req, res) => {
  const { name, email, password } = req.body;

  const user = new Sample({ name, email, password });
  await user.save();

  res.json({ message: "User added", user });
});

// Get all users
router.get("/all", async (req, res) => {
  const users = await Sample.find();
  res.json(users);
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await Sample.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting user" });
  }
});

module.exports = router;
