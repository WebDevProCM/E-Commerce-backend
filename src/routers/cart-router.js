const express = require("express");
const apiAuth = require("../middleware/apiAuth.js");
const cartController = require("../controllers/cart-controller.js")

const router = new express.Router();

router.post("/api/cart", apiAuth, cartController.create);

router.get("/api/cart", apiAuth, cartController.getAll);

router.get("/api/cart/:id", apiAuth, cartController.getOne);

router.patch("/api/cart/:id", apiAuth, cartController.update);

router.delete("/api/cart/:id", apiAuth, cartController.remove);

module.exports = router;