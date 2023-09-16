const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deparmentSchema = new Schema(
    {
        _id: {type: mongoose.Types.ObjectId},
        code: {type: String, required: true},
        name: {type: String, required: true},
    },
    {
        timestamps: true
    }
);

const DEPARMENT = mongoose.model("deparments", deparmentSchema);
module.exports = DEPARMENT;