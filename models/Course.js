const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: { type: String },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  image: { type: String }, // base64 or URL as you currently use
  video: {
    data: Buffer,         // store raw binary
    contentType: String,  // e.g. "video/mp4"
  },
  rating: { type: Number, default: 0 },
  category: {
    type: String,
    enum: ["Accounts", "Linux", "Machine Learning", "Marketing", "UI/UX", "Web Development", "Data Science", "Cyber Security", "Cloud Computing", "Blockchain", "DevOps", "Mobile Development", "Game Development", "Artificial Intelligence", "Networking", "Database Management", "Software Testing", "Project Management", "Digital Marketing", "Graphic Design"],
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
});

module.exports = mongoose.model("Course", CourseSchema);
