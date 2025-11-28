const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// controllers
const {
  addCourse,
  getAllCourses,
  deleteCourse,
  getCourseById,
  updateCourse,
  getProviderCourses
} = require("../controllers/courseController");
const { protect } = require("../authMiddleware");

// Accept fields: image (single) and video (single)
router.post("/add", upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]), addCourse);

// Accept fields: image and video (optional)
router.put(
  "/update/:id",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]),
  updateCourse
);


router.get("/all", getAllCourses);
router.get("/my-courses", protect ,getProviderCourses);
router.get("/:id", getCourseById);
router.delete("/delete/:id", deleteCourse);

module.exports = router;
