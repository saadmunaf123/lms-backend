const CourseChapter = require("../models/CourseChapter");

exports.addChapter = async (req, res) => {
  try {
    const { title } = req.body;
    const { courseId } = req.params;

    const chapter = new CourseChapter({
      title,
      course: courseId,
      video: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
        : null,
    });

    await chapter.save();

    res.json({ message: "Chapter added successfully", chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCourseChapters = async (req, res) => {
  try {
    const { courseId } = req.params;

    const chapters = await CourseChapter.find({ course: courseId }).sort({ order: 1 });

    const formatted = chapters.map((ch) => ({
      _id: ch._id,
      title: ch.title,
      description: ch.description || "",
      order: ch.order || 0,
      video: ch.video?.data ? ch.video.data.toString("base64") : null,
      videoContentType: ch.video?.contentType || null,
    }));

    res.json({ chapters: formatted }); // IMPORTANT
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;

    const chapter = await CourseChapter.findOne({
      _id: chapterId,
      course: courseId,
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const formatted = {
      _id: chapter._id,
      title: chapter.title,
      description: chapter.description || "",
      order: chapter.order || 0,
      video: chapter.video?.data
        ? chapter.video.data.toString("base64")
        : null,
      videoContentType: chapter.video?.contentType || null,
    };

    res.json({ chapter: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
