const mongoose = require("mongoose");

let Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    maxAttendees: {
        type: Number,
        required: true
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
});

let Event = mongoose.model("Event", eventSchema);

module.exports = Event;