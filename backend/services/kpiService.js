const pool = require("../config/db");

async function calculateAndSaveKPI() {

    const [orders] = await pool.execute(
        "SELECT * FROM orders"
    );


    const totalOrders = orders.length;


    let released = 0;
    let hold = 0;
    let rejected = 0;

    let totalOrderValue = 0;


    orders.forEach(order => {

        totalOrderValue +=
            Number(order.amount || 0);


        if (order.status === "Release") {
            released++;
        }

        if (order.status === "Hold") {
            hold++;
        }

        if (order.status === "Reject") {
            rejected++;
        }

    });


    const percentage = (value, total) => {

        if (total === 0) return 0;

        return Number(
            ((value / total) * 100).toFixed(2)
        );
    };


    const releaseRate =
        percentage(released, totalOrders);

    const holdRate =
        percentage(hold, totalOrders);

    const rejectionRate =
        percentage(rejected, totalOrders);


    // ON TIME PAYMENT

    let paidOrders = 0;
    let onTimePayments = 0;


    orders.forEach(order => {

        if (
            order.payment_status === "Paid" &&
            order.payment_date &&
            order.due_date
        ) {

            paidOrders++;

            const paymentDate =
                new Date(order.payment_date);

            const dueDate =
                new Date(order.due_date);


            if (paymentDate <= dueDate) {

                onTimePayments++;
            }
        }

    });


    const onTimePaymentRate =
        percentage(
            onTimePayments,
            paidOrders
        );


    // O2C CYCLE TIME

    let totalCycleDays = 0;
    let completedOrders = 0;


    orders.forEach(order => {

        if (
            order.order_date &&
            order.payment_date
        ) {

            const start =
                new Date(order.order_date);

            const end =
                new Date(order.payment_date);


            const difference =
                end - start;


            const days =
                difference /
                (1000 * 60 * 60 * 24);


            totalCycleDays += days;

            completedOrders++;
        }

    });


    const averageO2CCycleTime =
        completedOrders === 0
            ? 0
            : Number(
                (
                    totalCycleDays /
                    completedOrders
                ).toFixed(2)
            );


    // SAVE KPI SNAPSHOT

    const [result] = await pool.execute(

        `INSERT INTO kpi_snapshots
        (
            release_rate,
            hold_rate,
            rejection_rate,
            on_time_payment_rate,
            average_o2c_cycle_time,
            total_order_value,
            total_orders,
            released_orders,
            hold_orders,
            rejected_orders
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
            releaseRate,
            holdRate,
            rejectionRate,
            onTimePaymentRate,
            averageO2CCycleTime,
            totalOrderValue,
            totalOrders,
            released,
            hold,
            rejected
        ]
    );


    return {
        id: result.insertId,
        releaseRate,
        holdRate,
        rejectionRate,
        onTimePaymentRate,
        averageO2CCycleTime,
        totalOrderValue,
        totalOrders,
        released,
        hold,
        rejected
    };
}


module.exports = {
    calculateAndSaveKPI
};
