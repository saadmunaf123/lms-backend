// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// require("dotenv").config();

// const app = express();
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
// }));
// app.use(express.json());

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// mongoose.connect(process.env.MONGO_URL)
//     .then(() => console.log("Connected to MongoDB"))
//     .catch(err => console.error("Could not connect to MongoDB", err));

// app.use('/api/samples', require('./routes/sampleRoutes'));
// app.use('/api/courses', require('./routes/courseRoutes'));

// app.use("/api/student", require("./routes/studentAuth"));
// app.use("/api/provider", require("./routes/providerAuth"));
// app.use("/api/admin", require("./routes/adminAuth"));
// app.use("/api/chapters", require("./routes/chapterRoutes"));



// app.get('/', (req, res) => {
//     res.send("Node.js Backend is running");
// });

// app.listen(5000, () => {
//     console.log("Server is running on port 5000");
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require("dotenv").config();

const app = express();

// ------------------ CORS ------------------
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ MongoDB ------------------
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// ------------------ Routes ------------------
app.use('/api/samples', require('./routes/sampleRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

app.use("/api/student", require("./routes/studentAuth"));
app.use("/api/provider", require("./routes/providerAuth"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/chapters", require("./routes/chapterRoutes"));

app.get('/', (req, res) => {
    res.send("Node.js Backend is running successfully");
});

// ------------------ Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
