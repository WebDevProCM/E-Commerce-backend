const express = require("express");
const adminController = require("../controllers/admin-controller.js");
const Adminauth = require("../middleware/auth.js");

const router = new express.Router();

router.post("/api/admin/logged", adminController.loginCheck);

router.post("/api/admin/login", adminController.login);

router.post("/api/admin/logout", Adminauth, adminController.logout);

//-------------------api endpoints---------------------------------------
router.post("/api/admin", adminController.createAdmin);

router.get("/api/admin", Adminauth, adminController.getAll);

router.get("/api/admin/:id", Adminauth, adminController.getOne);

router.patch("/api/admin/:id", adminController.update);

router.delete("/api/admin/:id", Adminauth, adminController.remove);

module.exports = router;