const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api", routes);
app.use(errorHandler);

module.exports=app;