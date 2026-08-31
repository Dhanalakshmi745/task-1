const pool = require("../config/db");

// CREATE ORDER
exports.createOrder = async (req, res) => {

    try {

        const {
            orderNumber,
            customer,
            amount,
            paymentStatus,
            orderDate,
            dueDate
        } = req.body;


        if (!orderNumber || !customer || !amount || !paymentStatus) {

            return res.status(400).json({
                message: "Order number, customer, amount and payment status are required"
            });
        }


        // Automatically determine status

        let status = "Hold";

        if (paymentStatus === "Paid") {
            status = "Release";
        }

        if (
            paymentStatus === "Failed" ||
            paymentStatus === "Overdue"
        ) {
            status = "Reject";
        }


        const [result] = await pool.execute(

            `INSERT INTO orders
            (order_number, customer, amount, payment_status,
             status, order_date, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,

            [
                orderNumber,
                customer,
                amount,
                paymentStatus,
                status,
                orderDate || null,
                dueDate || null
            ]
        );


        const [rows] = await pool.execute(
            "SELECT * FROM orders WHERE id = ?",
            [result.insertId]
        );


        res.status(201).json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create order"
        });
    }
};


// GET ALL ORDERS

exports.getOrders = async (req, res) => {

    try {

        const [rows] = await pool.execute(
            "SELECT * FROM orders ORDER BY created_at DESC"
        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};


// GET ONE ORDER

exports.getOrder = async (req, res) => {

    try {

        const { id } = req.params;

        const [rows] = await pool.execute(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );


        if (rows.length === 0) {

            return res.status(404).json({
                message: "Order not found"
            });
        }


        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch order"
        });
    }
};


// UPDATE ORDER

exports.updateOrder = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            customer,
            amount,
            paymentStatus,
            orderDate,
            dueDate,
            deliveryDate,
            invoiceDate,
            paymentDate
        } = req.body;


        const [result] = await pool.execute(

            `UPDATE orders
             SET customer = ?,
                 amount = ?,
                 payment_status = ?,
                 order_date = ?,
                 due_date = ?,
                 delivery_date = ?,
                 invoice_date = ?,
                 payment_date = ?
             WHERE id = ?`,

            [
                customer,
                amount,
                paymentStatus,
                orderDate || null,
                dueDate || null,
                deliveryDate || null,
                invoiceDate || null,
                paymentDate || null,
                id
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Order not found"
            });
        }


        const [rows] = await pool.execute(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );


        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update order"
        });
    }
};


// DELETE ORDER

exports.deleteOrder = async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.execute(
            "DELETE FROM orders WHERE id = ?",
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Order not found"
            });
        }


        res.json({
            message: "Order deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete order"
        });
    }
};


// CHANGE ORDER STATUS

exports.changeStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        const [orders] = await pool.execute(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );


        if (orders.length === 0) {

            return res.status(404).json({
                message: "Order not found"
            });
        }


        const order = orders[0];


        // BUSINESS RULE

        if (
            status === "Release" &&
            order.payment_status !== "Paid"
        ) {

            return res.status(400).json({

                message:
                    "Order cannot be released because payment is not completed."
            });
        }


        if (
            !["Release", "Hold", "Reject"].includes(status)
        ) {

            return res.status(400).json({
                message: "Invalid status"
            });
        }


        let query = `
            UPDATE orders
            SET status = ?
        `;

        let values = [status];


        if (status === "Release") {

            query += `, release_date = CURDATE()`;
        }


        query += ` WHERE id = ?`;

        values.push(id);


        await pool.execute(query, values);


        const [updated] = await pool.execute(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );


        res.json(updated[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to change order status"
        });
    }
};
