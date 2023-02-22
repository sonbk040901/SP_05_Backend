const receivableRouter = require("express").Router();
const receivableCtrl = require("../controllers/receivable");
receivableRouter.put("/:orderId", receivableCtrl.update.bind(receivableCtrl));
receivableRouter.get("/", receivableCtrl.receivable.bind(receivableCtrl));
module.exports = receivableRouter;
