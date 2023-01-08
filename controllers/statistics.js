const { getAllOrders, parseOrder } = require("../example/req");
class StatisticsController {
  /**
   * @brief Get statistics
   * @param {Request} req
   * @param {Response} res
   */
  async statistics(req, res) {
    const { type, year, month } = req.query;
    try {
      const orders = await getAllOrders({ type, year, month });
      const parsedOrders = await Promise.all(
        orders.map(async (order) => await parseOrder(order))
      );
      return res.status(200).json({ status: "success", data: parsedOrders });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  async test(req, res) {
    const axios = require("axios");
    const res1 = await axios.get(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
      {
        headers: {
          token: "11802752-8ab4-11ed-b190-ea4934f9883e",
        },
        params: {
          district_id: 1488,
        },
      }
    );
    const data = res1.data.data.map((v) => {
      return v.WardCode;
    });

    return res.status(200).json({ status: "success", data });
  }
}

module.exports = new StatisticsController();
