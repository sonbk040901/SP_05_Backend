const { getAllOrders } = require("../api");
const { order } = require("./confirm");
const OrderUtil = require("../utils/order");
const CalcUtil = require("../utils/calculate");
class StatisticsController {
  /**
   * @brief Get statistics
   * @param {Request} req
   * @param {Response} res
   */
  async statistics(req, res) {
    try {
      /**
       * @type {{type: string,year: number,month: number,status: string}}
       */
      const query = req.query;
      const orders = await getAllOrders(query);
      let date = new Date(query.year, query.month);
      if (query.type === "month") {
        date.setMonth(date.getMonth() - 1);
        query.month = date.getMonth();
      } else if (query.type === "year") {
        date.setFullYear(date.getFullYear() - 1);
        query.year = date.getFullYear();
      }
      const prvOrders = await getAllOrders(query);
      const parsedOrders = await OrderUtil.parseMultiOrder(orders);
      const parsedPrvOrders = await OrderUtil.parseMultiOrder(prvOrders);
      const { totalCapital, totalPrices, totalQuantities } =
        OrderUtil.statistics(parsedOrders);
      const { totalCapital: prvTotalCapital, totalPrices: prvTotalPrices } =
        OrderUtil.statistics(parsedPrvOrders);
      const statistics = {
        totalRevenue: totalPrices - totalCapital,
        totalCapital,
        totalPrices,
        totalQuantities,
        growthPercentage: {
          totalRevenue: CalcUtil.calculatePercentage(
            prvTotalPrices - prvTotalCapital,
            totalPrices - totalCapital
          ),
          totalCapital: CalcUtil.calculatePercentage(
            prvTotalCapital,
            totalCapital
          ),
          totalPrices: CalcUtil.calculatePercentage(
            prvTotalPrices,
            totalPrices
          ),
        },
      };
      return res.status(200).json({
        status: "success",
        data: { statistics },
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  /**
   *
   * @param {Request} req
   * @param {Response} res
   */
  async statisticsYear(req, res) {
    try {
      const orders = await getAllOrders(req.query);
      const parsedOrders = await OrderUtil.parseMultiOrder(orders);
      // console.log(parsedOrders[0]);
      const statistics = OrderUtil.statisticsYear(parsedOrders);
      return res.status(200).json({
        status: "success",
        data: { statistics },
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  /**
   * @deprecated
   */
  async test(req, res) {
    const orders = [];
    try {
      for (let index = 1; index <= 10000; index++) {
        orders.push(new StatisticsController().gen(index));
      }
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
    return res.status(200).json({ status: "success", data: orders });
  }
  /**
   *  @brief Generate a random order
   * @param {number} num
   * @deprecated
   */
  gen(num) {
    //random a date betwen 2018-01-01 and 2022-01-10
    const randomDate = (start, end) => {
      let date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      )
        .toISOString()
        .split("T")[0];
      return {
        created_at: date,
        update_at: date,
        shiptime_start_at: date,
        completed_at: date,
        paytime: date,
        order_time: date,
      };
    };
    let total = 0;
    const order = {
      orderId: "OD" + num,
      userId: Math.floor(Math.random() * 1000) + 1,
      ...randomDate(new Date(2018, 0, 1), new Date(2023, 0, 10)),
      DistrictID: 1488,
      ProvinceID: 201,
      WardCode: "1A0302",
      detailAddress:
        "số 12 ngõ 12 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội",
      products: new Array(Math.floor(Math.random() * 10) + 1)
        .fill(1)
        .map(() => {
          let q = Math.floor(Math.random() * 10) + 1;
          total += q * 12000;
          return {
            productId: Math.floor(Math.random() * 1000) + 1,
            productName: "Vở Campus",
            productStatus: "1",
            price: q * 12000,
            quantity: q,
            img: "https://ngoclanvpp.vn/User_folder_upload/admin/images/Vo-Campus-NB-BDAW120-2-120-trang.jpeg",
            size: "80Tr",
            color: "Hồng",
          };
        }),
      total_price: total + (Math.floor(Math.random() * 100) + 1) * 1000,
    };
    return order;
  }
}

module.exports = new StatisticsController();
