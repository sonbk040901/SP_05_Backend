const API = require("../api");
class RejectController {
  async order(req, res) {
    const { orderId } = req.params;
    try {
      await API.updateOrderStatus(orderId, "đã hủy");
      return res
        .status(200)
        .json({ status: "success", message: "Order rejected" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
}
module.exports = new RejectController();
