const router = require("express").Router();
const orderCtrl = require("../controllers/order");

router.get("/", orderCtrl.get);
// router.get("/:orderId", orderCtrl.show);

module.exports = router;
