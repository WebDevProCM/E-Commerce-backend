const express = require("express");
const Adminauth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");

const usersController = require("../controllers/users-controller.js");

const router = new express.Router();

router.get("/user/logged", usersController.loginCheck);

router.post("/user/login", usersController.login);
router.post("/user/logout", apiAuth, usersController.logout);
//-------------------api endpoints---------------------------------------
router.post("/api/user", usersController.create);

router.get("/api/user/:id", apiAuth, usersController.getOne);

router.get("/api/users", Adminauth, usersController.getAll);

router.patch("/api/user/:id", apiAuth, usersController.update);

router.delete("/api/user/:id", Adminauth, usersController.remove);

module.exports = router;