const express = require("express");
const router = express.Router();


// ==================== MODELS ====================

// Listing model
const Listing = require("../models/listing.js");

// Booking model
const Booking = require("../models/booking.js");


// ==================== UTILS ====================

// Async error handle karne ke liye
const wrapAsync = require("../utils/wrapAsync.js");


// ==================== MIDDLEWARE ====================

// Authentication aur validation middleware
const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");


// ==================== CONTROLLER ====================

// Listing controller
const listingController = require("../controllers/listings.js");


// ==================== MULTER ====================

// Image upload ke liye multer
const multer = require("multer");

// Cloudinary storage
const { storage } = require("../cloudConfig.js");

// Multer ko Cloudinary storage ke saath connect
const upload = multer({ storage });


// ======================================================
//                    ALL LISTINGS
// ======================================================

// GET /listings
// POST /listings

router.route("/")

    // Saari listings show
    .get(
        wrapAsync(listingController.index)
    )

    // New listing create
    .post(
        isLoggedIn,

        // Maximum 4 images upload
        upload.array("listing[images]", 4),

        // Listing validation
        validateListing,

        // Create listing
        wrapAsync(listingController.createListing)
    );


// ======================================================
//                    MY BOOKINGS
// ======================================================

// GET /listings/my-bookings

router.get(
    "/my-bookings",

    // Sirf logged-in user access kar sakta hai
    isLoggedIn,

    // My bookings controller
    wrapAsync(listingController.myBookings)
);


// ======================================================
//                    NEW LISTING
// ======================================================

// GET /listings/new

router.get(
    "/new",

    // Login required
    isLoggedIn,

    // New listing form
    listingController.renderNewForm
);


// ======================================================
//                    BOOKING FORM
// ======================================================

// GET /listings/:id/book

router.get(
    "/:id/book",

    // Login required
    isLoggedIn,

    async (req, res) => {

        // Listing ID
        let { id } = req.params;

        // Listing database se find
        let listing = await Listing.findById(id);

        // Agar listing nahi mili
        if (!listing) {

            req.flash(
                "error",
                "Listing you requested for does not exist!"
            );

            return res.redirect("/listings");
        }

        // Booking page render
        res.render("listings/book.ejs", {
            listing
        });
    }
);


// ======================================================
//                    CREATE BOOKING
// ======================================================

// POST /listings/:id/book

router.post(
    "/:id/book",

    // User login hona chahiye
    isLoggedIn,

    // Person 1 ka Aadhaar image upload
    upload.single("guestsDetails[0][aadharCard]"),

    // Async error handling
    wrapAsync(async (req, res) => {

        // URL se listing ID
        let { id } = req.params;


        // Form se data le rahe hain
        let {
            checkIn,
            checkOut,
            guests,
            guestsDetails
        } = req.body;


        // Listing find kar rahe hain
        let listing = await Listing.findById(id);


        // Agar listing nahi mili
        if (!listing) {

            req.flash(
                "error",
                "Listing you requested for does not exist!"
            );

            return res.redirect("/listings");
        }


        // ==================================================
        //                 DATE VALIDATION
        // ==================================================

        // Check-in aur check-out date check
        let checkInDate = new Date(checkIn);
        let checkOutDate = new Date(checkOut);


        // Agar date invalid hai
        if (
            isNaN(checkInDate.getTime()) ||
            isNaN(checkOutDate.getTime())
        ) {

            req.flash(
                "error",
                "Please select valid check-in and check-out dates."
            );

            return res.redirect(`/listings/${id}/book`);
        }


        // Check-out check-in ke baad hona chahiye
        if (checkOutDate <= checkInDate) {

            req.flash(
                "error",
                "Check-out date must be after check-in date."
            );

            return res.redirect(`/listings/${id}/book`);
        }


        // ==================================================
        //                 TOTAL NIGHTS
        // ==================================================

        // Check-in aur check-out ke beech ke days
        let totalNights =
            (checkOutDate - checkInDate) /
            (1000 * 60 * 60 * 24);


        // ==================================================
        //                 TOTAL PRICE
        // ==================================================

        // Total guests
        let guestCount = Number(guests);


        // Guest count valid hai ya nahi
        if (!guestCount || guestCount < 1) {

            req.flash(
                "error",
                "Please enter at least 1 guest."
            );

            return res.redirect(`/listings/${id}/book`);
        }


        // 3 guests per room
        let rooms = Math.ceil(guestCount / 3);


        // Listing price × rooms × nights
        let totalPrice =
            Number(listing.price) * rooms * totalNights;


        // ==================================================
        //                 GUEST DETAILS
        // ==================================================

        // Guest details ko array me le rahe hain
        let guestData = guestsDetails || [];


        // Agar sirf ek guest hai to array me convert
        if (!Array.isArray(guestData)) {
            guestData = [guestData];
        }


        // ==================================================
        //                 AADHAAR IMAGE
        // ==================================================

        // Person 1 ka Aadhaar image save kar rahe hain
        if (req.file && guestData.length > 0) {

            guestData[0].aadharCard = {

                // Cloudinary image URL
                url: req.file.path,

                // Cloudinary public ID
                public_id: req.file.filename
            };
        }


        // ==================================================
        //              TEMPORARY BOOKING DATA
        // ==================================================

        // Payment complete hone tak booking data session me save
        req.session.pendingBooking = {

            // Kis listing ki booking hai
            listing: id,

            // Kis user ne booking ki
            user: req.user._id,

            // Check-in date
            checkIn: checkIn,

            // Check-out date
            checkOut: checkOut,

            // Total guests
            guests: guestCount,

            // Guest names + Person 1 Aadhaar
            guestsDetails: guestData,

            // Total booking price
            totalPrice: totalPrice
        };


        // ==================================================
        //                 PAYMENT PAGE
        // ======================================================

        // Demo payment page par bhej rahe hain
        res.render("listings/payment.ejs", {

            // Listing details
            listing,

            // Total price
            totalPrice,

            // Total nights
            totalNights,

            // Rooms
            rooms
        });

    })
);


// ======================================================
//                    DEMO PAYMENT
// ======================================================

// POST /listings/:id/payment

router.post(
    "/:id/payment",

    // User login hona chahiye
    isLoggedIn,

    // Async error handling
    wrapAsync(async (req, res) => {

        // URL se listing ID
        let { id } = req.params;


        // Session se pending booking data le rahe hain
        let pendingBooking = req.session.pendingBooking;


        // Agar booking data session me nahi hai
        if (!pendingBooking) {

            req.flash(
                "error",
                "Booking session expired. Please try again."
            );

            return res.redirect(`/listings/${id}/book`);
        }


        // ==================================================
        //              PAYMENT METHOD
        // ==================================================

        // Demo payment method
        let { paymentMethod } = req.body;


        // Payment method check
        if (!paymentMethod) {

            req.flash(
                "error",
                "Please select a payment method."
            );

            return res.redirect(`/listings/${id}/book`);
        }


        // ==================================================
        //                 CREATE BOOKING
        // ==================================================

        // Payment successful hone ke baad booking create
        let booking = new Booking({

            // Kis listing ki booking hai
            listing: pendingBooking.listing,

            // Kis user ne booking ki
            user: req.user._id,

            // Check-in date
            checkIn: pendingBooking.checkIn,

            // Check-out date
            checkOut: pendingBooking.checkOut,

            // Total guests
            guests: pendingBooking.guests,

            // Guest details
            guestsDetails: pendingBooking.guestsDetails,

            // Total booking price
            totalPrice: pendingBooking.totalPrice,

            // Booking status
            status: "Confirmed"
        });


        // Booking database me save
        await booking.save();


        // ==================================================
        //                 CLEAR SESSION
        // ==================================================

        // Payment ke baad temporary booking delete
        delete req.session.pendingBooking;


        // ==================================================
        //                 SUCCESS MESSAGE
        // ==================================================

        req.flash(
            "success",
            "Payment Successful! Booking Confirmed Successfully! 🎉"
        );


        // My bookings page par redirect
        res.redirect("/listings/my-bookings");

    })
);


// ======================================================
//                    SHOW LISTING
// ======================================================

// GET /listings/:id

router.get(
    "/:id",

    // Show listing
    wrapAsync(listingController.showListing)
);


// ======================================================
//                    EDIT LISTING
// ======================================================

// GET /listings/:id/edit

router.get(
    "/:id/edit",

    // Login required
    isLoggedIn,

    // Owner check
    isOwner,

    // Edit form
    wrapAsync(listingController.renderEditForm)
);


// ======================================================
//                    UPDATE LISTING
// ======================================================

// PUT /listings/:id

router.put(
    "/:id",

    // Login required
    isLoggedIn,

    // Owner check
    isOwner,

    // New images upload
    upload.array("listing[images]", 4),

    // Listing validation
    validateListing,

    // Update listing
    wrapAsync(listingController.updateListing)
);


// ======================================================
//                    DELETE LISTING
// ======================================================

// DELETE /listings/:id

router.delete(
    "/:id",

    // Login required
    isLoggedIn,

    // Owner check
    isOwner,

    // Delete listing
    wrapAsync(listingController.destroyListing)
);


// ======================================================
//                    EXPORT ROUTER
// ======================================================

// Router ko app.js me export kar rahe hain
module.exports = router;