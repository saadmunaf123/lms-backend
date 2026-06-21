const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: { type: String },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  image: { type: String },
  video: {
    data: Buffer,        
    contentType: String,
  },
  rating: { type: Number, default: 0 },
  category: {
    type: String,
    enum: ["Web Development", "Data Science", "Artificial Intelligence", "UI/UX", "Machine Learning", "Marketing", "Linux", "Accounts"],
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
});

module.exports = mongoose.model("Course", CourseSchema);
