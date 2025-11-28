const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { protect: providerProtect } = require("../authMiddleware");
const { studentProtect } = require("../studentMiddleware");
const { addChapter, getCourseChapters, getSingleChapter } = require("../controllers/chapterController");

// Add chapter (Provider only)
router.post("/:courseId", providerProtect, upload.single("video"), addChapter);

// Get chapters (Student only)
router.get("/:courseId", studentProtect, getCourseChapters);

router.get("/provider/:courseId", providerProtect, getCourseChapters);

router.get("/:courseId/:chapterId", studentProtect, getSingleChapter);

module.exports = router;
