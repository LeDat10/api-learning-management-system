const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const bodyParser = require("body-parser");

const database = require("./config/database");

const routesAdmin = require("./routes/admin/index.route");
const routesClient = require("./routes/client/index.route");
database.connect();

const PORT = process.env.PORT;
app.use(cors());

app.use(bodyParser.json());

routesAdmin(app);
routesClient(app);
app.listen(PORT,() => {
    console.log(`App listen on PORT ${PORT}`);
});