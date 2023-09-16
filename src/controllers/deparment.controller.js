const mongoose = require("mongoose");
const DEPARMENT = require("../models/deparment.model");
const DEPARMENT_EMPLOYEE = require("../models/deparmentEmployee.model");

const deparmentController = {
    /*
        Api create new deparment
        Request structure
        {
            code: "<<deparment code>>",
            name: "<<deparment name>>"
        }
    */
    addNewDeparment: async (req, res) => {
        try {
            let data = { ...req.body };
            let newDeparment = new DEPARMENT(data);
            if(newDeparment.code && newDeparment.name) {
                let newID = new mongoose.Types.ObjectId();
                newDeparment._id = newID;
                await newDeparment.save();
                
                return res.status(200).json({"message": "Insert data successfull!"});
            }
            else {
                return res.status(500).json({"message": "Your request data is incorrect!"});
            }
        }
        catch (error) {
            return res.status(500).json({"message": error.message});
        }
    },

    /*
        Api update deparment
        Request structure
        {
            code: "<<deparment code>>",
            name: "<<deparment name>>"
        }
    */
    updateDeparment: async (req, res) => {
        try {
            let updateID = new mongoose.Types.ObjectId(req.params.id);
            let dataUpdate = { ...req.body };

            await DEPARMENT.findByIdAndUpdate(updateID, dataUpdate);
            return res.status(200).json({"message": "Update data successfull!"});
        }
        catch (error) {
            return res.status(500).json({"message": error.message});
        }
    },

    /* 
        Api get all deparment
        No parameter 
    */
    getAllDeparment: async (req, res) => {
        try {
            let deparments = await DEPARMENT.find().sort("name");
            return res.status(200).json({"message": "Get all deparments successfull!", "data": deparments})
        }
        catch (error) {
            return res.status(500).json({"message": error.message});
        }
    },

    /*
        Api delete deparment
    */
    deleteDeparment: async (req, res) => {
        // use mongo tracsaction to rollback when process error
        let session = await mongoose.startSession();
        session.startTransaction();

        try {
            let opts = { session };
            let deparmentID = req.params.id;
            await DEPARMENT.findByIdAndDelete(deparmentID, opts);
            await DEPARMENT_EMPLOYEE.findOneAndDelete({deparment_id: deparmentID}, opts);

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({"message": "Delete data successfull!"});
        }
        catch (error) {
            session.abortTransaction();
            return res.status(500).json({"message": error.message});
        }
    }
};

module.exports = deparmentController;