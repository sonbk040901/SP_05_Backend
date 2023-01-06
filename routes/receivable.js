const receivableRouter = require("express").Router();
const receivableCtrl = require("../controllers/receivable");
receivableRouter.put("/:orderId", receivableCtrl.update);
module.exports = receivableRouter;
