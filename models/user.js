const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose").default;

/*
Note : You're free to define your User how you like. Passport-Local Mongoose will add a username,
hash and salt field to store the username, the hashed password and the salt value.

********************
yaha pe ham email he only is liye define kiye kyu ke name or hashing
passportLocalMongoose khud he add kar deta hai
*/

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
    },

    // User ka mobile number
    // Booking confirmation SMS ke liye use hoga
   

});


// Passport-Local-Mongoose username, hash, salt
// aur authentication methods automatically add karega
userSchema.plugin(passportLocalMongoose);


// User model export kar rahe hai
module.exports = mongoose.model('User', userSchema);