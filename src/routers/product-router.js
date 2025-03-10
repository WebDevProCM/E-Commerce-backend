const express = require("express");
const adminAuth = require("../middleware/auth.js");
const productsController = require("../controllers/products-controller.js");

const router = new express.Router();

//-------------------api endpoints---------------------------------------
router.post("/api/product", adminAuth, productsController.create);

router.get("/api/product/:id", productsController.getOne);

router.get("/api/products", productsController.getAll);

router.patch("/api/product/:id", adminAuth, productsController.update);

router.delete("/api/product/:id", adminAuth, productsController.remove);

module.exports = router;