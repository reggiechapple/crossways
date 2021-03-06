const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    profile: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    // liked posts
    liked_posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    // liked comments
    liked_comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    campaigns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign"
        }
    ],
    work: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign"
        }
    ],
    donations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation"
        }
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ],
    causes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cause"
        }
    ],
});

UserSchema.plugin(passportLocalMongoose);
let User = mongoose.model("User", UserSchema);
module.exports = User;
