let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let CampaignSchema = new Schema({
    name: String,
    description: String,
    fundsNeeded: Number,
    fundsRaised: Number,
    volunteersNeeded: Number,
    isOpen: { type: Boolean, default: false },
    closingStatement: String,
    initiator: { type: Schema.Types.ObjectId, ref: 'User' },
    volunteers: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ],
    volunteerRequests: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'User'
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
    cause: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cause"
    }
});

let Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;