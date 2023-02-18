const { getAllOrders, parseOrder, getUserById } = require("../example/req");
class OrderController {
  async get(req, res) {
    try {
      const orders = await getAllOrders(req.query);
      const parsedOrders = await Promise.all(
        orders.map(async (order) => {
          let o = await parseOrder(order);
          return o;
        })
      );

      return res.status(200).json({
        status: "success",
        data: { orders: parsedOrders },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
}
module.exports = new OrderController();
