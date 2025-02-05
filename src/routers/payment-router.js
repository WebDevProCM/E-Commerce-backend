const express = require("express");
const apiAuth = require("../middleware/apiAuth");
const { createPayment } = require("../controllers/payment-controller");

const router = new express.Router();

router.post("/api/payment/create-checkout-session", apiAuth, createPayment);

module.exports = router;