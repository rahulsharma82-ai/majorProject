const Listing = require("../models/listing");
const Booking = require("../models/booking");

// My Bookings controller
module.exports.myBookings = async (req, res) => {

  console.log("Logged in User ID:", req.user._id);

  let bookings = await Booking.find({
    user: req.user._id
  }).populate("listing");

  console.log("My Bookings:", bookings);

  // Deleted listings wali bookings ko remove kar rahe hai
  bookings = bookings.filter((booking) => booking.listing);

  res.render("listings/my-bookings.ejs", { bookings });
};


// ==========================================
// INDEX / ALL LISTINGS
// ==========================================

module.exports.index = async (req, res) => {

  // URL se search aur category ki value le rahe hai
  let { search, category } = req.query;

  // Listing filter karne ke liye empty object
  let filter = {};


  // ==========================================
  // SEARCH
  // ==========================================

  // Agar user search karta hai
  if (search) {

    // Title, location aur country me search kar rahe hai
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];

  }


  // ==========================================
  // CATEGORY
  // ==========================================

  // Agar user koi category select karta hai
  if (category) {

    // Sirf selected category ki listings find hongi
    filter.category = category;

  }


  // ==========================================
  // FIND LISTINGS
  // ==========================================

  // Database se listings find kar rahe hai
  // Reviews ko populate kar rahe hai
  let allListings = await Listing.find(filter)
    .populate("reviews");


  // ==========================================
  // AVERAGE RATING
  // ==========================================

  // Har listing ke liye average rating calculate kar rahe hai
  allListings.forEach((listing) => {

    // Check kar rahe hai ki listing par review hai ya nahi
    if (listing.reviews.length > 0) {

      // Saare reviews ki rating ko add kar rahe hai
      let totalRating = listing.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      // Average rating calculate kar rahe hai
      listing.averageRating = (
        totalRating / listing.reviews.length
      ).toFixed(1);

    } else {

      // Agar koi review nahi hai
      listing.averageRating = null;

    }

  });


  // ==========================================
  // LOCATION WISE LISTINGS
  // ==========================================

  // Location ke according listings ko group karne ke liye
  let listingsByLocation = {};


  // Har listing ko check kar rahe hai
  allListings.forEach((listing) => {

    // Original location
    let location = listing.location.trim();

    // Capital/small letters aur extra spaces ignore kar rahe hai
    // Example:
    // "Chapra"
    // "chapra"
    // " CHAPRA "
    // tino same group me jayenge
    let locationKey = location.toLowerCase();


    // Agar is location ka group pehle se nahi hai
    if (!listingsByLocation[locationKey]) {

      listingsByLocation[locationKey] = {

        // Heading me original location show hoga
        name: location,

        // Is location ki saari listings
        listings: []

      };

    }


    // Current listing ko location ke group me add kar rahe hai
    listingsByLocation[locationKey].listings.push(listing);

  });


  // ==========================================
  // DATA EJS PAGE PAR SEND
  // ==========================================

  res.render("listings/index.ejs", {

    // Saari listings
    allListings,

    // Location-wise grouped listings
    listingsByLocation

  });

};


// ==========================================
// NEW LISTING FORM
// ==========================================

// Yaha isLoggedIn middleware authentication ke liye pass kiya gaya hai
module.exports.renderNewForm = (req, res) => {

  res.render("listings/new");

};


// ==========================================
// SHOW LISTING
// ==========================================

// Yaha show route ka controller hai
module.exports.showListing = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    })
    .populate("owner");


  // Agar listing nahi mili
  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist!"
    );

    return res.redirect("/listings");

  }


  // Listing ka data check karne ke liye
  // console.log(listing);

  res.render("listings/show", { listing });

};


// ==========================================
// CREATE LISTING
// ==========================================

// Create route ka controller
module.exports.createListing = async (req, res) => {

  let images = req.files.map((file) => ({

    url: file.path,
    filename: file.filename

  }));


  const newListing = new Listing(req.body.listing);


  // Listing ka owner logged-in user hoga
  newListing.owner = req.user._id;


  // First image ko old image field me save kar rahe hai
  newListing.image = images[0];


  // Multiple images ko images array me save kar rahe hai
  newListing.images = images;


  await newListing.save();


  req.flash(
    "success",
    "New Listing Created"
  );


  res.redirect("/listings");

};


// ==========================================
// EDIT LISTING
// ==========================================

module.exports.renderEditForm = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id);


  // Agar listing nahi mili
  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist!"
    );

    return res.redirect("/listings");

  }


  // Preview image ka size kam kar rahe hai
  let originalImageUrl = listing.image.url;

  originalImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/h_300,w_250"
  );


  res.render(
    "listings/edit.ejs",
    {
      listing,
      originalImageUrl
    }
  );

};


// ==========================================
// UPDATE LISTING
// ==========================================

module.exports.updateListing = async (req, res) => {

  let { id } = req.params;


  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing }
  );


  // Agar new images upload ki gayi hain
  if (req.files && req.files.length > 0) {

    let images = req.files.map((file) => ({

      url: file.path,
      filename: file.filename

    }));


    // First image ko old image field me save kar rahe hai
    listing.image = images[0];


    // Multiple images ko images array me save kar rahe hai
    listing.images = images;


    await listing.save();

  }


  req.flash(
    "success",
    "Listing Updated Successfully"
  );


  res.redirect(`/listings/${id}`);

};


// ==========================================
// DELETE LISTING
// ==========================================

module.exports.destroyListing = async (req, res) => {

  let { id } = req.params;


  let deletedListing = await Listing.findByIdAndDelete(id);


  // Deleted listing check karne ke liye
  // console.log(deletedListing);


  req.flash(
    "success",
    "Listing Deleted Successfully"
  );


  res.redirect("/listings");

};