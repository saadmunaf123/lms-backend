const Course = require("../models/Course");
const Provider = require("../models/Provider");
const jwt = require("jsonwebtoken");

exports.addCourse = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // Extract providerId from token instead of body
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    let providerId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      providerId = decoded.id; // make sure your token contains provider's ID as `id`
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Image handling
    let imageBase64 = null;
    if (req.files && req.files.image && req.files.image[0]) {
      imageBase64 = req.files.image[0].buffer.toString("base64");
    } else if (req.file && req.file.fieldname === "image") {
      imageBase64 = req.file.buffer.toString("base64");
    }

    // Video handling
    let videoBuffer = null;
    let videoContentType = null;
    if (req.files && req.files.video && req.files.video[0]) {
      videoBuffer = req.files.video[0].buffer;
      videoContentType = req.files.video[0].mimetype;
    } else if (req.file && req.file.fieldname === "video") {
      videoBuffer = req.file.buffer;
      videoContentType = req.file.mimetype;
    }

    const { title, rating, category, difficulty } = req.body;

    const courseData = {
      title,
      provider: providerId, // use provider instead of instructor
      rating,
      category,
      difficulty,
      image: imageBase64,
    };

    if (videoBuffer && videoContentType) {
      courseData.video = {
        data: videoBuffer,
        contentType: videoContentType,
      };
    }

    const course = new Course(courseData);
    await course.save();

    // Update provider's coursesUploaded array
    const provider = await Provider.findById(providerId);
    if (provider) {
      provider.coursesUploaded.push(course._id);
      await provider.save();
    }

    const responseCourse = course.toObject();
    if (responseCourse.video && responseCourse.video.data) {
      responseCourse.video = responseCourse.video.data.toString("base64");
      responseCourse.videoContentType = course.video.contentType;
    }

    res.json({ message: "Course added successfully", courseId: course._id, course: responseCourse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add course" });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("provider", "name email")
      .lean(); // returns plain objects

    // Remove video fields safely
    const out = courses.map((c) => {
      delete c.video;              // remove binary video
      delete c.videoContentType;   // remove mimetype
      return c;
    });

    res.json(out);
  } catch (err) {
    console.error(err); // log exact error
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};


// PUT /api/courses/update/:id
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course)
      return res.status(404).json({ error: "Course not found" });

    const { title, instructor, rating, category, difficulty } = req.body;

    // Update fields only if they exist in request body
    if (title !== undefined) course.title = title;
    if (instructor !== undefined) course.instructor = instructor;
    if (rating !== undefined) course.rating = rating;
    if (category !== undefined) course.category = category;
    if (difficulty !== undefined) course.difficulty = difficulty;

    // Image upload
    if (req.files && req.files.image) {
      course.image = req.files.image[0].buffer.toString("base64");
    }

    // Video upload
    if (req.files && req.files.video) {
      course.video = {
        data: req.files.video[0].buffer,
        contentType: req.files.video[0].mimetype,
      };
    }

    await course.save();

    res.json({
      message: "Course updated successfully",
      course: {
        ...course.toObject(),
        video: course.video?.data
          ? course.video.data.toString("base64")
          : null,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update course" });
  }
};




exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const obj = course.toObject();

    // Convert video correctly
    if (obj.video && obj.video.data) {
      const videoData = obj.video.data.toString("base64");
      const videoType = obj.video.contentType;

      obj.video = videoData;
      obj.videoContentType = videoType;
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Delete course (unchanged)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};


// Get courses uploaded by logged-in provider
// Get courses uploaded by the logged-in provider

exports.getProviderCourses = async (req, res) => {
  try {
    const providerId = req.user._id; // set by protect middleware

    // Find courses for this provider and populate provider info
    const courses = await Course.find({ provider: providerId })
      .populate("provider", "name email") // populate name and email only
      .lean(); // convert to plain JS objects

    // Remove video binary data from each course
    const result = courses.map((c) => {
      delete c.video;         // remove video buffer
      return c;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch provider's courses" });
  }
};
