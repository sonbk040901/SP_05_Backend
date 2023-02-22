const path = require("path");
const fs = require("fs");
const { getOrderById, getAllOrders } = require("../api");
class ReceivableController {
  async update(req, res) {
    try {
      const { orderId } = req.params;
      const order = await getOrderById(orderId);
      let message =
        (!order && "Order not found") ||
        (order.payment_method !== "shipcod" &&
          `Payment method '${order.payment_method}' not support`) ||
        (order.status === "chờ xác nhận" && "Order status is pending") ||
        (order.status === "đang giao" && "Order status is delivering") ||
        (order.status === "đã hủy" && "Order status is canceled");
      if (message) {
        return res.status(404).json({ status: "error", message });
      }
      let orders = this.getAll();
      if (orders.find((o) => o.orderId === parseInt(orderId))) {
        return res
          .status(404)
          .json({ status: "error", message: "Order already updated" });
      }
      orders.push({
        orderId: parseInt(orderId),
        completedAt: new Date().toISOString(),
      });
      this.updateOrders(orders);
      return res
        .status(200)
        .json({ status: "success", message: "Successful debt update" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  async receivable(req, res) {
    const db = this.getAll();
    try {
      let orders = await getAllOrders({});
      orders = orders.filter((o) => o.payment_method == "shipcod");
      let collected = orders.filter((o) =>
        db.find((c) => c.orderId === o.orderId)
      );
      let unCollected = orders.filter(
        (o) => !db.find((c) => c.orderId === o.orderId)
      );
      return res
        .status(200)
        .json({ status: "success", data: { unCollected, collected } });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  getAll() {
    /**
     * @type {{orders: Array}}
     */
    let res1 = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname.replace("controllers", "models/receivable.json"),
          ""
        ),
        "utf8"
      )
    );
    return res1.orders;
  }
  updateOrders(orders) {
    fs.writeFileSync(
      path.join(__dirname.replace("controllers", "models/receivable.json"), ""),
      JSON.stringify({ orders }, " ", 4)
    );
  }
}

module.exports = new ReceivableController();

/**
 * @typedef {{
 * productId: number,
 * productName: string,
 * productStatus: string,
 * price: string,
 * quantity: number,
 * img: string,
 * size: string,
 * color: string
 * }} Product
 */
/**
 * @typedef {{
 * orderId: number,
 * status: string,
 * payment_method: string,
 * userId: number,
 * created_at: Date,
 * update_at: Date,
 * shiptime_start_at: Date,
 * completed_at: Date,
 * paytime: Date,
 * order_time: Date,
 * DistrictID: string,
 * ProvinceID: string,
 * WardCode: string,
 * detailAddress: string,
 * total_price: number,
 * comment: string,
 * rate: string,
 * products: Product[]
 * }} Order
 */
