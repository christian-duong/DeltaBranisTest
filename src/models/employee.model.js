const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
    {
        _id: {type: mongoose.Types.ObjectId},
        code: {type: String, required: true},
        name: {type: String, required: true},
        phone: {type: Number},
        email: {type: String, default: ""},
        sex: {type: Number, required: true, default: 0},
        avatar: {type: String}
    },
    {
        timestamps: true
    }
);

const EMPLOYEE = mongoose.model("employees", employeeSchema);
module.exports = EMPLOYEE;