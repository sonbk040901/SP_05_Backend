const ApiRouter = require("express").Router();

ApiRouter.use("/confirm", require("./confirm"));
ApiRouter.use("/receivable", require("./receivable"));
module.exports = ApiRouter;
