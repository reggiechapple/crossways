let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let CampaignSchema = new Schema({
    name: String,
    description: String,
    fundsNeeded: Number,
    fundsRaised: Number,
    volunteersNeeded: Number,
    isOpen: {type: Boolean, default: false},
    closingStatement: String,
    initiator: { type: Schema.Types.ObjectId, ref: 'User' },
    volunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    volunteerRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

let Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;