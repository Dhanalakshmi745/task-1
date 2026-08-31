const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const orderRoutes =
    require("./routes/orderRoutes");

const kpiRoutes =
    require("./routes/kpiRoutes");


const app = express();


// Middleware

app.use(cors());

app.use(express.json());


// Routes

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/kpi",
    kpiRoutes
);

app.use(
    express.static(
        path.join(__dirname, "frontend", "dist")
    )
);

// Health check

app.get("/", (req, res) => {

    res.json({
        message: "O2C Backend API is running"
    });

});


// Start server

const PORT =
    process.env.PORT || 8080;


app.listen(PORT, () => {

    console.log(
        `O2C Backend running on port ${PORT}`
    );

});

app.get("*", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "frontend",
            "dist",
            "index.html"
        )
    );
});
