const User = require("../models/user");

// ==================== SIGNUP PAGE ====================
// Ye function signup form ko browser par show karta hai.
module.exports.renderSignupFrom = (req, res) => {
    res.render("users/signup.ejs");
};


// ==================== SIGNUP ====================
// Ye function new user ko database me register karta hai.
module.exports.signup = async (req, res) => {
    try {

        // Signup form se username, email, phone aur password receive kar rahe hain.
        let { username, email, phone, password } = req.body;

        // User ka email, username aur phone database ke liye object me bana rahe hain.
        const newUser = new User({
            email,
            username,
            phone
        });

        // Passport-Local-Mongoose password ko hash karke user ko register karta hai.
        const registeredUser = await User.register(newUser, password);

        

        // Yaha pe ham function bana rhe take user jaise signup kare wo login ho jayee
        req.login(registeredUser, (err) => {

            // Agar login karte time error aaye to next middleware ko error bhejenge.
            if (err) {
                return next(err);
            }

            // Signup successful hone par success message show karenge.
            req.flash("success", "Welcome to Wanderlust.");

            // Signup ke baad listings page par redirect karenge.
            res.redirect("/listings");
        });

    } catch (err) {

        // Signup me error aaye to error message flash me show karenge.
        req.flash("error", err.message);

        // User ko dobara signup page par bhejenge.
        res.redirect("/signup");
    }
};


// ==================== LOGIN PAGE ====================
// Ye function login form ko browser par show karta hai.
module.exports.renderLoginFrom = (req, res) => {
    res.render("users/login.ejs");
};


// ==================== LOGIN ====================
// Passport authentication successful hone ke baad ye function run hota hai.
module.exports.login = async (req, res) => {

    // Login successful hone par welcome message show karenge.
    req.flash("success", "Welcome back to Wanderlust");

    // User ko usi page par redirect karenge jahan se login ke liye aaya tha.
    // Agar redirectUrl nahi hai to /listings par jayega.
    res.redirect(res.locals.redirectUrl || "/listings");
};


// ==================== LOGOUT ====================
// Ye function user ko logout karta hai.
module.exports.logout = (req, res, next) => {

    req.logout((err) => {

        // Logout ke time error aaye to next middleware ko bhejenge.
        if (err) {
            return next(err);
        }

        // Logout successful hone par message show karenge.
        req.flash("success", "You are logged out!");

        // Logout ke baad listings page par redirect karenge.
        res.redirect("/listings");
    });

};