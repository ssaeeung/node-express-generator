const { model } = require("mongoose");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency

const LeaderSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },
    description: {
        type: String,
        require: true
    },
}, {
    timestamps: true
});

var Leaders = mongoose.model('Leader', LeaderSchema);
module.exports = Leaders;