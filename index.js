const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const fileUpload = require("express-fileupload");
require("dotenv").config();

// Connect to mongo database
async function connectDatabase() {
    await mongoose.connect(process.env.MONGO_PATH);
}
connectDatabase();
mongoose.Promise = global.Promise;

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static("images")); // Public folder to access

app.use("/delta-brains-api/deparment", require("./src/routes/deparment.route"));
app.use("/delta-brains-api/employee", require("./src/routes/employee.route"));

server.listen(process.env.PORT, process.env.IP, () => console.log(`New api listening on ${process.env.IP}:${process.env.PORT}`));