const confirmRouter = require("express").Router();
const confirmCtrl = require("../controllers/confirm");
confirmRouter.put("/order/:orderId", confirmCtrl.order);
confirmRouter.post("/exchange/:orderId", confirmCtrl.exchange);
confirmRouter.post("/return/:orderId", confirmCtrl.return);
module.exports = confirmRouter;
