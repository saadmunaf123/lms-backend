const Course = require("../models/Course");
const Provider = require("../models/Provider");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

exports.addCourse = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

   
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

  
    let imageBase64 = null;
    if (req.files && req.files.image && req.files.image[0]) {
      imageBase64 = req.files.image[0].buffer.toString("base64");
    } else if (req.file && req.file.fieldname === "image") {
      imageBase64 = req.file.buffer.toString("base64");
    }

  
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
      provider: providerId, 
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


exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("provider", "name email")
      .lean();

  
    const out = courses.map((c) => {
      delete c.video;            
      delete c.videoContentType;  
      return c;
    });

    res.json(out);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};



exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course)
      return res.status(404).json({ error: "Course not found" });

    const { title, instructor, rating, category, difficulty } = req.body;

  
    if (title !== undefined) course.title = title;
    if (instructor !== undefined) course.instructor = instructor;
    if (rating !== undefined) course.rating = rating;
    if (category !== undefined) course.category = category;
    if (difficulty !== undefined) course.difficulty = difficulty;

   
    if (req.files && req.files.image) {
      course.image = req.files.image[0].buffer.toString("base64");
    }


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


exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (admin) {
      await Provider.findByIdAndUpdate(course.provider, {
        $pull: {
          coursesUploaded: course._id,
        },
      });

      await Course.findByIdAndDelete(id);

      return res.json({
        message: "Course deleted by admin",
      });
    }

    if (course.provider.toString() !== decoded.id) {
      return res.status(403).json({
        error: "You are not authorized to delete this course",
      });
    }

    await Provider.findByIdAndUpdate(course.provider, {
      $pull: {
        coursesUploaded: course._id,
      },
    });

    await Course.findByIdAndDelete(id);

    res.json({
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete course",
    });
  }
};


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
