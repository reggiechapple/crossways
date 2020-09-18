const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
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


router.get("/campaigns/:id", isLoggedIn, (req, res) => {
    Campaign.findById(req.params.id)
        .populate("volunteers")
        .populate("volunteerRequests")
        .populate("initiator")
        .populate({
          path: 'events',
          populate: {
            path: 'attendees',
            model: 'User'
          }
       })
        .populate({
            path: 'donations',
            populate: {
              path: 'donor',
              model: 'User'
            }
         })
        .exec((err, campaign) => {
            if (err) {
                console.log(err);
                req.flash("error", "There has been an error finding this campaign");
                res.redirect("back");
            } else {
                res.render("campaigns/show", { campaign: campaign });
            }
        });
});

router.get("/campaigns/:id/volunteer", isLoggedIn, (req, res) => {
    // First finding the logged in user
    User.findById(req.user._id, (err, user) => {
        if (err) {
            console.log(err);
            req.flash(
                "error",
                "There has been an error sending your request"
            );
            res.redirect("back");
        } else {
            // finding the user that needs to be added
            Campaign.findById(req.params.id, (err, campaign) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Campaign not found");
                    res.redirect("back");
                } else {
                    // FOUNDUSER IS THE USER THAT THE LOGGED IN USER WANTS TO ADD
                    // USER IS THE CURRENT LOGGED IN USER

                    // checking if the user is already in foundUsers friend requests or friends list
                    if (
                        campaign.volunteerRequests.find(o =>
                            o._id.equals(user._id)
                        )
                    ) {
                        req.flash(
                            "error",
                            `You have already sent a volunteer request to ${
                                campaign.name
                            }`
                        );
                        return res.redirect("back");
                    } else if (
                        campaign.volunteers.find(o => o._id.equals(user._id))
                    ) {
                        req.flash(
                            "error",
                            `You already a volunteer of ${
                                campaign.name
                            }.`
                        );
                        return res.redirect("back");
                    }
                    campaign.volunteerRequests.push(user);
                    campaign.save();
                    req.flash(
                        "success",
                        `Success! You sent ${
                            campaign.name
                        } a volunteer request!`
                    );
                    res.redirect(`/campaigns/${campaign._id}`);
                }
            });
        }
    });
});

router.get("/campaigns/:cid/accepts/:uid", isLoggedIn, (req, res) => {
    Campaign.findById(req.params.cid, (err, campaign) => {
        if (err) {
            console.log(err);
            req.flash(
                "error",
                "There has been an error finding the campaign."
            );
            res.redirect("back");
        }
        else {
            User.findById(req.params.uid, (err, user) => {
                let r = campaign.volunteerRequests.find(o =>
                    o._id.equals(user._id));
                
                if (r) {
                    let index = campaign.volunteerRequests.indexOf(r);
                    campaign.volunteerRequests.splice(index, 1);
                    campaign.volunteers.push(user);
                    campaign.save();

                    user.work.push(campaign);
                    user.save();

                    req.flash(
                        "success",
                        `You added ${user.firstName} to ${campaign.name}!`
                    );
                    res.redirect("back");
                }
                else {
                    req.flash(
                        "error",
                        "There has been an error, is the profile you are trying to add on your requests?"
                    );
                    res.redirect("back");
                }
            });
        }
    });
});

router.post("/campaigns/:id/donate", isLoggedIn, (req, res) => {

    Campaign.findById(req.params.id, (err, campaign) => {
        if (err) {
            console.log(err);
            req.flash(
                "error",
                "There has been an error finding the campaign."
            );
            res.redirect("back");
        }
        else {
            if (req.body.amount) {
                let donation = {};
                donation.amount = req.body.amount;
                donation.donor = req.user;
                donation.campaign = campaign;
                return Donation.create(donation, (err, donation) => {
                    if (err) {
                        console.log(err);
                    } else {
                        req.user.donations.push(donation._id);
                        req.user.save();

                        campaign.donations.push(donation._id);
                        campaign.save();

                        res.redirect("back");
                    }
                });
            }
            req.flash(
                "error",
                "You must enter an amount."
            );
            res.redirect("back");
        }
    });

});

router.post("/campaigns/:id/new-event", isLoggedIn, (req, res) => {

    Campaign.findById(req.params.id, (err, campaign) => {
        if (err) {
            console.log(err);
            req.flash(
                "error",
                "There has been an error finding the campaign."
            );
            res.redirect("back");
        }
        else {
            if (req.body.name) {
                let event = {};
                event.name = req.body.name;
                event.location = req.body.location;
                event.date = req.body.date;
                event.startTime = req.body.startTime;
                event.endTime = req.body.endTime;
                event.maxAttendees = req.body.maxAttendees;
                event.campaign = campaign;
                return Event.create(event, (err, event) => {
                    if (err) {
                        console.log(err);
                    } else {
                        campaign.events.push(event._id);
                        campaign.save();
                        res.redirect("back");
                    }
                });
            }
            req.flash(
                "error",
                "You must fill in all fields."
            );
            res.redirect("back");
        }
    });
});

router.get("/events/:id/attend", isLoggedIn, (req, res) => {
  Event.findById(req.params.id, (err, event) => {
    if (err) {
      console.log(err);
      req.flash(
        "error",
        "There has been an error finding the campaign."
      );
      res.redirect("back");
    }
    else {
      User.findById(req.user._id, (err, user) => {
        let ea = event.attendees.find(o =>
          o._id.equals(user._id));
      
        if (!ea) {
          event.attendees.push(user);
          event.save();

          user.events.push(event);
          user.save();

          req.flash(
              "success",
              `You have been added to ${event.name}!`
          );
          res.redirect("back");
        }
        else if (ea) {
          req.flash(
            "error",
            `You have already been added to ${event.name}!`
          );
          res.redirect("back");
        }
        else {
            req.flash(
                "error",
                "There has been an error, is the profile you are trying to add on your requests?"
            );
            res.redirect("back");
        }
      });
    }
  });
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