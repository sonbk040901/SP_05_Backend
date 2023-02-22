const {
  sendReqToTranferService,
  sendReqToWarehouseService,
  sendRedeliverReqToTranferService,
  sendReturnReqToTranferService,
  getOrderById,
  updateOrderStatus,
} = require("../api");
class ConfirmController {
  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<Response>}
   */
  async order(req, res) {
    const { orderId } = req.params;
    try {
      const order = await getOrderById(orderId);
      const serviceRes = await Promise.all([
        sendReqToTranferService(order),
        sendReqToWarehouseService(order),
        updateOrderStatus(orderId, "chờ lấy hàng"),
      ]);
      return res
        .status(200)
        .json({ status: "success", message: "Order confirmed", serviceRes });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }
  async exchange(req, res) {
    const { orderId } = req.params;
    try {
      let order = await getOrderById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ status: "error", message: "Order not found" });
      }
      const serviceRes = await Promise.all([
        sendRedeliverReqToTranferService(order),
        sendReqToWarehouseService(order),
        updateOrderStatus(orderId, "đang giao"),
      ]);
      return res
        .status(200)
        .json({ status: "success", message: "Order exchanged", serviceRes });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }

  async return(req, res) {
    const { orderId } = req.params;
    try {
      let order = await getOrderById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ status: "error", message: "Order not found" });
      }
      let serviceRes = await Promise.all([
        sendReturnReqToTranferService(order),
        sendReqToWarehouseService(order),
        updateOrderStatus(orderId, "trả hàng-hoàn tiền"),
      ]);
      return res
        .status(200)
        .json({ status: "success", message: "Order returned", serviceRes });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }
}

module.exports = new ConfirmController();
