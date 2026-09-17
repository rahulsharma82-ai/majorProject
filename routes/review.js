const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/review.js");

// middleware se validateReview require kar rhe hai
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// ****************** Reviews Route ******************

router.post(
  "/",
  isLoggedIn,// yaha middleware use take jo user login hai wahe review de or delete kar paye
  validateReview,
  wrapAsync(reviewController.createdReview) // yaha v wahe kam kiye review ka controller banaye
);
// **************** Delete Reviews Route ****************
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;