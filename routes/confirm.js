const confirmRouter = require("express").Router();
const confirmCtrl = require("../controllers/confirm");
confirmRouter.post("/order", confirmCtrl.order);
confirmRouter.post("/exchange", confirmCtrl.exchange);
confirmRouter.post("/return", confirmCtrl.return);
module.exports = confirmRouter;
