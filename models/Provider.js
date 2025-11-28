const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProviderSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    coursesUploaded: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
});

ProviderSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
module.exports = mongoose.model("Provider", ProviderSchema);