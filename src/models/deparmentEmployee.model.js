const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deparmentEmployeeSchema = new Schema(
    {
        _id: {type: mongoose.Types.ObjectId},
        employee_id: {type: mongoose.Types.ObjectId, ref: "employees", required: true},
        deparment_id: {type: mongoose.Types.ObjectId, ref: "deparments", required: true}
    },
    {
        timestamps: true
    }
);

const DEPARMENT_EMPLOYEE = new mongoose.model("deparment_employees", deparmentEmployeeSchema);
module.exports = DEPARMENT_EMPLOYEE;