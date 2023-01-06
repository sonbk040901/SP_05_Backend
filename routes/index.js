const ApiRouter = require("express").Router();
const confirm = require("./confirm");
ApiRouter.use("/confirm", confirm);

module.exports = ApiRouter;
