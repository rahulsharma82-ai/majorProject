// yaha pe ham model se listing ko require kar rhe hai 
const Listing = require("./models/listing.js");
const Review = require("./models/review.js"); // ✅ ye add karo
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    // Check karenge ki user login hai ya nahi
    if (!req.isAuthenticated()) {
//  yaha pe ham ye karna chah rhe hai ke koi user new listings create kar rha hai bina login ke 
//  to usko login hone ke same url matlab ke new listinge pe he leke jayeye login ke bad 
//  iska or part user.js me login ke redirect me v hai .
     req.session.redirectUrl = req.originalUrl;

        // Agar user login nahi hai, error message show karenge
        req.flash("error", "You must be logged in to create Listings");
        // User ko login page par bhej denge
        return res.redirect("/login");
    }
    // Agar user login hai, to uska data req.user mein milega
    console.log(req.user);
    // Next route/middleware par jaane denge
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    // Check if redirectUrl is stored in session
    if (req.session.redirectUrl) {
        // Make redirectUrl available in all EJS files
        res.locals.redirectUrl = req.session.redirectUrl;
        // Remove it from session after saving
        delete req.session.redirectUrl;
    }
    // Move to the next middleware
    next();
};


module.exports.isOwner= async(req,res,next)=>{
    
  // yaha pe ham kar rhe hai ke koi v aadmi like hopschock se ya postman ke through listing ko
  // update na kare iske liye Authorization laga rhe hai like protect kar rhe hai
 let  {id} = req.params;
  let listing = await Listing.findById(id);

  // check kar rhe hai ki jo user listing ko update kar raha hai,
  // kya wahi listing ka owner hai ya nahi
  if (!listing.owner.equals(res.locals.currUser._id)) {

    req.flash("error", "You are not the owner of this listing");

    // agar user owner nahi hai to wahi se redirect kar denge
    return res.redirect(`/listings/${id}`);
  }
  next();
}
// Validation middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
};

// yaha pe review ka middleware create kar rhe hai 

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  // Review ko database se find kar rahe hain
  let review = await Review.findById(reviewId);

  // Check kar rahe hain ki logged-in user hi review ka author hai
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Author of this Review");

    return res.redirect(`/listings/${id}`);
  }

  next();
};