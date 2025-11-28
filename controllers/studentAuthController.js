const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const studentSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await Student.findOne({ email });
        if (exists)
            return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new Student({
            name,
            email,
            password: hashedPassword,
        });

        await student.save();

        res.status(201).json({ message: 'Student signup successful' });
    } catch (err) {
        res.status(500).json({ error: 'Signup failed' });
    }
};


const studentLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        const student = await Student.findOne({ email });
        if(!student) return res.status(400).json({ error: 'Invalid email or password'});

        const isMatch = await bcrypt.compare(password, student.password);
        if(!isMatch) return res.status(400).json({ error: 'Invalid email or password'});

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            token,
            student: {
                _id: student._id,
                name: student.name,
                email: student.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed'});
    };
};


const allStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json({ students });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch students'});
    }
};

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).select('-password');
        if(!student) return res.status(404).json({ error: 'Student not found'});
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student'});
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndDelete(id);
        if(!student) return res.status(404).json({ error: 'Student not found'});
        res.json({ message: 'Student deleted successfully'});
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student'});
    }
};


const enrollCourse = async (req, res) => {
  try {
    const studentId = req.student.id;  // from middleware
    const { courseId } = req.params;

    const student = await Student.findById(studentId);

    // 🔍 Check if already enrolled
    const alreadyEnrolled = student.enrolledCourses.some(
      (course) => course.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // 🚀 Enroll new course
    student.enrolledCourses.push({ courseId });
    await student.save();

    res.json({ message: "Course enrolled successfully" });

  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const checkEnrollment = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { courseId } = req.params;

    const student = await Student.findById(studentId);

    const enrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === courseId
    );

    res.json({ enrolled });

  } catch (err) {
    res.status(500).json({ error: "Error checking enrollment" });
  }
};



module.exports = { studentSignup, studentLogin, allStudents, getStudentById, deleteStudent, enrollCourse,  checkEnrollment};