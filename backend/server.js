const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");
const kpiRoutes = require("./routes/kpiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/kpi", kpiRoutes);

// Serve React frontend
const frontendPath = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(frontendPath));

// React SPA fallback
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`O2C Backend running on port ${PORT}`);
});