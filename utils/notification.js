// ==================== PACKAGES ====================

// Email send karne ke liye Nodemailer
const nodemailer = require("nodemailer");

// SMS send karne ke liye Twilio
const twilio = require("twilio");


// ==================== EMAIL SETUP ====================

// Gmail/SMTP ke through email send karne ke liye transporter
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        // .env se email read hoga
        user: process.env.EMAIL_USER,

        // .env se Gmail App Password read hoga
        pass: process.env.EMAIL_PASS
    }
});


// ==================== TWILIO SETUP ====================

// Twilio client create kar rahe hain
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);


// ==================== SEND NOTIFICATION ====================

// Booking confirmation email aur SMS send karne wala function
const sendBookingNotification = async ({
    email,
    phone,
    listingTitle,
    guests,
    checkIn,
    checkOut,
    totalPrice
}) => {

    // ==================== EMAIL ====================

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,

        subject: "Wanderlust Booking Confirmation 🎉",

        text: `
Your booking has been confirmed successfully!

Listing: ${listingTitle}
Number of Persons: ${guests}
Check-in: ${checkIn}
Check-out: ${checkOut}
Total Price: ₹${totalPrice}

Thank you for booking with Wanderlust.
        `
    });


    // ==================== SMS ====================

    await twilioClient.messages.create({
        body: `Wanderlust: Your booking for ${guests} person(s) is confirmed. Check-in: ${checkIn}, Check-out: ${checkOut}. Total: ₹${totalPrice}.`,

        // User ka phone number
        to: phone,

        // Twilio ka registered phone number
        from: process.env.TWILIO_PHONE_NUMBER
    });
};


// Function ko export kar rahe hain
module.exports = {
    sendBookingNotification
};