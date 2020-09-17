const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const DonationSchema = new Schema({
    amount: { type: Number, required: true },
    donor: { type: Schema.Types.ObjectId, ref: 'User' },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
});

let Donation = mongoose.model("Donation", DonationSchema);

module.exports = Donation;