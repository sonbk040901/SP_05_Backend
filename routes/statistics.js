const statisticsRouter = require("express").Router();
const statisticsCtrl = require("../controllers/statistics");
statisticsRouter.get("/", statisticsCtrl.statistics);
// statisticsRouter.get("/test", statisticsCtrl.test);
module.exports = statisticsRouter;
