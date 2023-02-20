const {
  sendReqToTranferService,
  sendReqToWarehouseService,
  getOrderById,
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
    const order = await getOrderById(orderId);
    try {
      const serviceRes = await Promise.all([
        sendReqToTranferService(order),
        sendReqToWarehouseService(order),
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
      return res
        .status(200)
        .json({ status: "success", message: "Order exchanged" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }

  async return(req, res) {
    const { orderId } = req.params;
    try {
      return res
        .status(200)
        .json({ status: "success", message: "Order returned" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    // ...
  }
}

module.exports = new ConfirmController();
