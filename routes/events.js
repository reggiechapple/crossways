const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Event = require("../models/Event");

const router = express.Router();

// Middleware
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/user/login");
};



module.exports = router;