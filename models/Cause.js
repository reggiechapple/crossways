const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const causeSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum : ['Animals', 'Environment', 'Humans'],
    },
    campaigns: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Campaign'
        }
    ],
    supporters: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

let Cause = mongoose.model("Cause", causeSchema);

module.exports = Cause;