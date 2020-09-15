const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const router = express.Router();

// Middleware
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/user/login");
};

router.get("/campaigns", isLoggedIn, (req, res) => {
    // get all campaigns
    Campaign.find({}).populate("initiator").exec((err, campaigns) => {
        if (err) {
            console.log(err);
            req.flash(
                "error",
                "There has been an error finding all campaigns."
            );
            res.render("campaigns/index"); // campaigns will be undefined/null
        }
        else {
            if (campaigns) {
                res.render("campaigns/index", {
                    campaigns: campaigns
                });
            } else {
                res.render("campaigns/index", { campaigns: null });
            }
        }
    });
});

// New Post GET Route
router.get("/campaigns/new", isLoggedIn, (req, res) => {
    res.render("campaigns/new");
});

// New Campaign POST Route
router.post("/campaigns/new", isLoggedIn, (req, res) => {
    if (req.body.name) {
        let newCampaign = {};
        newCampaign.name = req.body.name;
        newCampaign.initiator = req.user;
        newCampaign.description = req.body.description;
        newCampaign.fundsNeeded = req.body.fundsNeeded;
        newCampaign.fundsRaised = 0;
        newCampaign.volunteersNeeded = req.body.volunteersNeeded;
        newCampaign.isOpen = true;
        return createCampaign(newCampaign, req, res);
    }
});

// helper function for the /post/new POST route
function createCampaign(newCampaign, req, res) {
    Campaign.create(newCampaign, (err, campaign) => {
        if (err) {
            console.log(err);
        } else {
            req.user.campaigns.push(campaign._id);
            req.user.save();
            res.redirect("/campaigns");
        }
    });
}

module.exports = router;