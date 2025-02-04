const express = require("express");
const apiAuth = require("../middleware/apiAuth.js");
const adminAuth = require("../middleware/auth.js");
const reviewsController = require("../controllers/reviews-controller.js")

const router = new express.Router();

router.post("/api/review", apiAuth, reviewsController.create);

router.get("/api/review", reviewsController.getAll);

router.get("/api/review/:id", reviewsController.getOne);

router.patch("/api/review/:id", adminAuth, reviewsController.update);

router.delete("/api/review/:id", adminAuth, reviewsController.remove);

module.exports = router;