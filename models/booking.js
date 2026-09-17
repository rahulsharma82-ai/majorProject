const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

    // Which listing was booked
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },

    // Which user made the booking
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Booking check-in date
    checkIn: {
        type: Date,
        required: true
    },

    // Booking check-out date
    checkOut: {
        type: Date,
        required: true
    },

    // Total number of guests
    guests: {
        type: Number,
        required: true
    },

    // Guest names + first person's Aadhaar card
    guestsDetails: [
        {
            // Guest's full name
            name: {
                type: String,
                required: true
            },

            // Aadhaar image URL and Cloudinary ID
            // Required only for Person 1 in the booking route
            aadharCard: {
                url: String,
                public_id: String
            }
        }
    ],

    // Final booking amount
    totalPrice: {
        type: Number,
        required: true
    },

    // Current booking status
    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed"
    }

});


// Create Booking model
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;