const {
  sendReqToTranferService,
  sendReqToWarehouseService,
} = require("../example/req");
class ConfirmController {
  // ...
  async order(req, res) {
    if (!req.body?.data?.order) {
      return res
        .status(400)
        .json({ status: "error", message: "Order not found" });
    }
    const order = req.body.data.order;
    try {
      const serviceRes = await Promise.all([
        sendReqToTranferService(order),
        sendReqToWarehouseService(order),
      ]);
      return res
        .status(200)
        .json({ status: "success", message: "Order confirmed", serviceRes });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }
  async exchange(req, res) {
    const { orderId } = req.params;
    try {
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }

  async return(req, res) {
    const { orderId } = req.params;
    try {
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }
}

module.exports = new ConfirmController();
