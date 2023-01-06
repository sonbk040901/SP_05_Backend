const confirmRouter = require("express").Router();
const confirmCtrl = require("../controllers/confirm");
confirmRouter.post("/order", confirmCtrl.order);

module.exports = confirmRouter;
