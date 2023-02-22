const router = require("express").Router();
const rejectCtrl = require("../controllers/reject");

router.put("/:orderId", rejectCtrl.order);

module.exports = router;
