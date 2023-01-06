class ReceivableController {
  async update(req, res) {
    const { orderId } = req.params;
    try {
      return res
        .status(200)
        .json({ status: "success", message: "Order updated" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
}

module.exports = new ReceivableController();
