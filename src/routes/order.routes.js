const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/", authenticate, orderController.placeOrder);
router.get("/", authenticate, orderController.getUserOrders);
router.put("/:orderId/status", authenticate, orderController.updateOrderStatus);
router.delete("/:orderId", authenticate, orderController.cancelOrder);

module.exports = router;