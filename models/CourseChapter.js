const mongoose = require("mongoose");

const CourseChapterSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },

  title: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String 
  },

  video: {
    data: Buffer,          // actual video binary
    contentType: String,   // "video/mp4"
  },

  order: {
    type: Number,
    default: 0 // to sort chapters
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("CourseChapter", CourseChapterSchema);
