const express = require("express");

const router = express.Router();

const orderController =
    require("../controllers/orderController");


// CREATE
router.post("/", orderController.createOrder);

// READ ALL
router.get("/", orderController.getOrders);

// READ ONE
router.get("/:id", orderController.getOrder);

// UPDATE
router.put("/:id", orderController.updateOrder);

// DELETE
router.delete("/:id", orderController.deleteOrder);

// CHANGE STATUS
router.patch("/:id/status", orderController.changeStatus);


module.exports = router;
