const express = require("express");

const router = express.Router();

const kpiController =
    require("../controllers/kpiController");


// Calculate and save KPI
router.post(
    "/calculate",
    kpiController.calculateKPI
);


// Latest KPI
router.get(
    "/",
    kpiController.getLatestKPI
);


// KPI history
router.get(
    "/history",
    kpiController.getKPIHistory
);


module.exports = router;