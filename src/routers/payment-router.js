const express = require("express");
const apiAuth = require("../middleware/apiAuth");
const { createPayment, webhookListener } = require("../controllers/payment-controller");

const router = new express.Router();

router.post("/api/payment/create-checkout-session", apiAuth, createPayment);

router.post("/api/payment/webhook", webhookListener);

module.exports = router;