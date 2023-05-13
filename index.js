const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;
const cors = require("cors");
const db = require("./models");

const { authRoutes } = require("./routes");

db.sequelize.sync();

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/auth", authRoutes);
app.get("/", (req, res) => res.status(200).json({ message: "Hello World" }));

app.listen(port, () => console.log(`Listening on PORT ${port}`));