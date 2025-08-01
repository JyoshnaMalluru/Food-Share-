const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['donor', 'receiver','volunteer','admin'], required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
