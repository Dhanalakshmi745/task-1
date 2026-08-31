const pool = require("../config/db");

const {
    calculateAndSaveKPI
} = require("../services/kpiService");


// CALCULATE CURRENT KPI

exports.calculateKPI = async (req, res) => {

    try {

        const result =
            await calculateAndSaveKPI();

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to calculate KPI"
        });
    }
};


// GET LATEST KPI

exports.getLatestKPI = async (req, res) => {

    try {

        const [rows] = await pool.execute(

            `SELECT *
             FROM kpi_snapshots
             ORDER BY recorded_at DESC
             LIMIT 1`
        );


        if (rows.length === 0) {

            return res.status(404).json({
                message: "No KPI data available"
            });
        }


        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch KPI"
        });
    }
};


// GET KPI HISTORY

exports.getKPIHistory = async (req, res) => {

    try {

        const [rows] = await pool.execute(

            `SELECT *
             FROM kpi_snapshots
             ORDER BY recorded_at DESC
             LIMIT 20`
        );


        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch KPI history"
        });
    }
};
