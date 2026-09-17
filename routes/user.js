
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/user.js");

//yaha pe ham singup ko combine kar rhe hai for .router se take bar bar ek he route ko create na karn apare

router.route("/signup")
  .get(userController.renderSignupFrom)
  .post(wrapAsync(userController.signup));


// yaha pe login ko combine kar rhe hai 

router.route("/login")

.get( userController.renderLoginFrom)

.post(saveRedirectUrl ,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login)

router.get("/logout",userController.logout)
module.exports = router

// router.get("/signup",userController.renderSignupFrom);

// router.post("/signup", wrapAsync(userController.signup)
// );

// router.get("/login", userController.renderLoginFrom);

// router.post("/login", saveRedirectUrl ,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login)

// yaha pe ham create kar hai ke kaesi ham web page se logout ho paye

;

