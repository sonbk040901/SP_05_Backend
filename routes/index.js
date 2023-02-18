const ApiRouter = require("express").Router();

ApiRouter.use("/confirm", require("./confirm"));
ApiRouter.use("/receivable", require("./receivable"));
ApiRouter.use("/statistics", require("./statistics"));
ApiRouter.use("/order", require("./order"));
module.exports = ApiRouter;
