const mongoose = require("mongoose");
const EMPLOYEE = require("../models/employee.model");
const DEPARMENT_EMPLOYEE = require("../models/deparmentEmployee.model");
const uuid = require("uuid");

const employeeController = {
    /*
        Api create new employee
        Request structure
        {
            code: "<<Employee code>>",
            name: "<<Employee name>>",
            phone: <<Employee phone number>>,
            email: "<<Employee email>>",
            sex: <<Employee gender>>, // 0: male, 1: female
            avatar: "<<Employee url avatar>>",
            deparment_id: <<ID of deparment>>
        }
    */
    addNewEmployee: async (req, res) => {
        // use mongo tracsaction to rollback when process error
        let session = await mongoose.startSession();
        session.startTransaction();

        try {
            let opts = { session };
            let data = { ...req.body };
            let newEmployee = new EMPLOYEE(data);
            // Check employee name is exist in data request
            if (newEmployee.name) {
                // Insert employee
                newEmployee._id = new mongoose.Types.ObjectId();

                // Check employee code is exist in data request
                if (!newEmployee.code) {
                    let listEmployee = await EMPLOYEE.find().sort({createdAt: -1}).limit(1);
                    console.log(listEmployee);
                    let lastestEmployee = listEmployee[0];
                    if (lastestEmployee) {
                        let [firstHaftCode, lastHaftCode] = lastestEmployee.code.split("-");
                        if (parseInt(firstHaftCode)) {
                            let codeChar = lastHaftCode;
                            let codeNumber = firstHaftCode;
                            let codeNumberLen = codeNumber.length;
                            let newEmployeeCode = (parseInt(codeNumber) + 1).toString().padStart(codeNumberLen, "0") + "-" + codeChar;
                            newEmployee.code = newEmployeeCode;
                        }
                        else if(parseInt(lastHaftCode)) {
                            let codeChar = firstHaftCode;
                            let codeNumber = lastHaftCode;
                            let codeNumberLen = codeNumber.length;
                            let newEmployeeCode = codeChar + "-" + (parseInt(codeNumber) + 1).toString().padStart(codeNumberLen, "0");
                            newEmployee.code = newEmployeeCode;
                        }
                    }
                    else {
                        newEmployee.code = process.env.DEFAULT_EMPLOYEE_CODE
                    }
                }

                // Check file avatar is exist in data request and upload avatar to server
                if (req.files) {
                    let avatar = req.files.avatar;
                    let avatarName = `${uuid.v4()}.png`;
                    avatar.mv(`./images/${avatarName}`);
                    newEmployee.avatar = `${avatarName}`;
                }

                await newEmployee.save(opts);

                // Insert deparment employee
                if (data.deparment_id) {
                    let deparmentEmployeeData = {
                        _id: new mongoose.Types.ObjectId(),
                        employee_id: new mongoose.Types.ObjectId(newEmployee._id),
                        deparment_id: new mongoose.Types.ObjectId(data.deparment_id)
                    }
                    let newDeparmentEmployee = new DEPARMENT_EMPLOYEE(deparmentEmployeeData);
                    await newDeparmentEmployee.save(opts);
                }

                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({"message": "Insert data successfull!"});
            }
            else {
                
                return res.status(500).json({"message": "Employee name can't be empty"});
            }
        }
        catch (error) {
            session.abortTransaction();
            return res.status(500).json({"message": error.message});
        }
    },

    /*
        Api update employee
        Request structure
        {
            code: "<<Employee code>>",
            name: "<<Employee name>>",
            phone: <<Employee phone number>>,
            email: "<<Employee email>>",
            sex: <<Employee gender>>, // 0: male, 1: female
            avatar: "<<Employee url avatar>>",
            deparment_id: <<ID of deparment>>
        }
    */
    updateEmployee: async (req, res) => {
            // use mongo tracsaction to rollback when process error
            let session = await mongoose.startSession();
            session.startTransaction();

            try {
                let opts = { session };
                let employeeIdUpdate = new mongoose.Types.ObjectId(req.params.id);
                let dataUpdate = { ...req.body };

                // Check file avatar is change
                if (req.files) {
                    let avatar = req.files.avatar;
                    let avatarName = `${uuid.v4()}.png`;
                    avatar.mv(`./images/${avatarName}`);
                    dataUpdate.avatar = `${avatarName}`;
                }
                // Update data of collection employees
                await EMPLOYEE.findByIdAndUpdate(employeeIdUpdate, dataUpdate, opts);

                // Check deparment_id is change
                if (dataUpdate.deparment_id) {
                    // update data of collection deparment_employees
                    await DEPARMENT_EMPLOYEE.findOneAndUpdate(
                        {employee_id: employeeIdUpdate},
                        {deparment_id: dataUpdate.deparment_id},
                        opts
                    );
                }

                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({"message": "Update data successfull!"});
            }
            catch (error) {
                session.abortTransaction();
                return res.status(500).json({"message": error.message});
            }
    },

    /*
        Api get all employee
        No parameter 
    */
    getAllEmployee: async (req, res) => {
        try {
            let listEmployee = [];
            let employees = await EMPLOYEE.find().sort("createdAt");
            for await (let employee of employees) {
                let data = {employee: employee};
                let deparment_employee = await DEPARMENT_EMPLOYEE.findOne({employee_id: employee.id}).populate("deparment_id");
                if (deparment_employee) {
                    data.deparment = deparment_employee.deparment_id;
                }
                listEmployee.push(data);
            }
            return res.status(200).json({"message": "Get all employee successfull!", "data": listEmployee});
        }
        catch (error) {
            return res.status(500).json({"message": error.message});
        }
    },

    /*
        Api get employee by id
    */
    getEmployeeById: async (req, res) => {
        try {
            let employeeID = req.params.id;
            let employee = await EMPLOYEE.findById(employeeID);
            if (employee) {
                let response = {employee: employee};
                let deparment_employee = await DEPARMENT_EMPLOYEE.findOne({employee_id: employee.id}).populate("deparment_id");
                if (deparment_employee) {
                    response.deparment = deparment_employee.deparment_id;
                }
                return res.status(200).json({"message": "Get employee successfull!", "data": response});
            }
            else {
                return res.status(200).json({"message": "Employee could not found"});
            }
        }
        catch (error) {
            return res.status(500).json({"message": error.message});
        }
    },

    /*
        Api delete employee
    */
    deleteEmployee: async (req, res) => {
        // use mongo tracsaction to rollback when process error
        let session = await mongoose.startSession();
        session.startTransaction();

        try {
            let opts = { session };
            let employeeID = req.params.id;
            await EMPLOYEE.findByIdAndDelete(employeeID, opts);
            await DEPARMENT_EMPLOYEE.findOneAndDelete({employee_id: employeeID}, opts);

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

module.exports = employeeController;