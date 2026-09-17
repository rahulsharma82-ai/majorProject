
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Review = require("./review.js");

const listingSchema = new Schema({

  title: {

    type: String,

    required: true,

  },

  description: String,

  // Listing image ka structure

  image: {

    url: String,

    filename: String

  },

  // Multiple listing images ke liye

  images: [

    {

      url: String,

      filename: String

    }

  ],

  price: Number,

  location: String,

  country: String,

  reviews: [

    {

      type: Schema.Types.ObjectId,

      ref: "Review",

    }

  ],

  owner: {

    type: Schema.Types.ObjectId,

    ref: "User",

  },

  category: {

    type: String,

    enum: [

        "Trending",

        "Rooms",

        "Iconic Cities",

        "Castles",

        "Amazing Pools",

        "Camping",

        "Farms",

        "Arctic"

    ]

},

});

// Review delete karne ke liye middleware

listingSchema.post("findOneAndDelete", async (listing) => {

  if (listing) {

    await Review.deleteMany({

      _id: { $in: listing.reviews }

    });

  }

});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

