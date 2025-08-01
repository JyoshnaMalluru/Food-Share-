const mongoose = require("mongoose");

const foodPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    location: { type: String, required: true },
    bestBefore: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['available', 'requested', 'picked', 'delivered'], 
        default: 'available' 
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Donor
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Receiver
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Volunteer
    pickupDate: { type: Date, default: null },
    deliveryDate: { type: Date, default: null },
    donorCannotDeliver: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const FoodPost = mongoose.model("FoodPost", foodPostSchema);
module.exports = FoodPost;