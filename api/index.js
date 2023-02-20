const axios = require("axios");
const fs = require("fs");
const { response } = require("express");
const OrderUtil = require("../utils/order");
const path = require("path");
const BASE_URL_TRANSFER = process.env.BASE_URL_TRANSFER;
const BASE_URL_WAREHOUSE = process.env.BASE_URL_WAREHOUSE;
const BASE_URL_PRODUCTION = process.env.BASE_URL_PRODUCTION;
const BASE_URL_ORDER = process.env.BASE_URL_ORDER || "";
const BASE_URL_USER = process.env.BASE_URL_USER || "";
const sendReqToTranferService = async (order) => {
  const body = await OrderUtil.parseRequestTranferService(order);
  // console.log(body);
  try {
    const response = await axios.post(
      BASE_URL_TRANSFER + "shipping_order",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    if (!data?.result?.ok) {
      throw new Error(data?.result?.message);
    }
    return data;
  } catch (error) {
    throw new Error(
      (error?.message ||
        error?.response?.data.error ||
        error?.response?.data?.result) + " from transfer service"
    );
  }
};
const sendReqToWarehouseService = async (order) => {
  const body = await OrderUtil.parseRequestWarehouseService(order);
  try {
    const response = await axios.post(BASE_URL_WAREHOUSE + "export", body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.response.data?.message ||
        error.response.data?.error + " from warehouse service"
    );
  }
};

/**
 * @brief API get product by product id
 * @param {string} itemId
 * @returns {
  Promise<{
    message: 'success',
    data: {
      id?: 4,
      image_url?: string,
      product_id?: 4,
      color_id?: 6,
      size_id?: 4,
      created_at?: string,
      updated_at?: string,
      quantity?: string,
      color?: { id: 6, name: string, code: string },
      size?: { id: 4, name: string }
    }
  }>
 */
const getProductByItemId = async (itemId) => {
  try {
    const response = await axios.get(
      BASE_URL_PRODUCTION + `sub-products/${itemId}`
    );
    const data = response.data;
    if (data === null) throw new Error("Item not found");
    return data;
  } catch (error) {
    throw new Error(error.response.data.message + " from production service");
  }
};
/**
 * @brief API get order by id
 * @param {string} orderId
 * @returns {Promise<orderExample>}
 */
const getOrderById = async (orderId) => {
  let response;
  let url;
  try {
    url = BASE_URL_ORDER + `getOrderById/${orderId}`;
    console.log(url);
    if (BASE_URL_ORDER) response = await axios.get(url);
    else response = { data: { ...orderExample, orderId } };
    const data = response.data[0];
    return data;
  } catch (error) {
    throw new Error(error + " from order service");
  }
};
/**
 * @brief API get all order from order service
 * @param {{type: string,year: number,month: number, status: string}} query
 * @returns
 */
const getAllOrders = async ({ type, year, month, status }) => {
  /** @type {{data: [OrderUtil.orderExample]}} */
  let response;
  try {
    if (BASE_URL_ORDER) {
      response = await axios.get(BASE_URL_ORDER + "listOrderByUser/21");
    } else {
      let res1 = JSON.parse(
        fs.readFileSync(
          path.join(__dirname.replace("api", "mock/mock.json"), ""),
          "utf8"
        )
      );
      response = { data: res1 };
    }
    let data = response.data;
    if (type) {
      data = data.filter((order) => {
        let date = new Date(order.created_at);
        switch (type) {
          case "year":
            return date.getFullYear() == year;
          case "month":
            return date.getFullYear() == year && date.getMonth() + 1 == month;
          default:
            return true;
        }
      });
    }
    if (status) {
      switch (status) {
        case "PENDING": //Đang chờ xác nhận
          status = "đang chờ";
          break;
        case "ACCEPT": //Đã xác nhận(chờ lấy hàng)
          status = "chờ lấy hàng";
          break;
        case "REJECT": //Đã hủy
          status = "đã hủy";
          break;
        case "DELIVERING": //Đang giao hàng
          status = "đang giao";
          break;
        case "DELIVERED": //Đã giao hàng
          status = "đã giao";
          break;
        case "SUCCESS": //Đã hoàn thành
          status = "thành công";
          break;
        case "RETURN": //Đã trả hàng
          status = "trả hàng-hoàn tiền";
          break;
        case "EXCHANGE": //Đã đổi hàng
          status = "đổi hàng";
          break;
        default:
          break;
      }
      data = data.filter((order) => order.status == status);
    }
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message + " from order service"
    );
  }
};

const getUserById = async (userId) => {
  let url = BASE_URL_USER + `user`;
  let response;
  try {
    response = await axios.get(url);
    const users = response.data;
    const user = users.find((user) => user.id == userId);
    return user;
  } catch (error) {
    throw new Error(error + " from user service");
  }
};
const API_GET_PROVINCE =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";
const API_GET_DISTRIC =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";
const API_GET_WARD =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward";
const ACCESS_TOKEN_GET_PDW = "11802752-8ab4-11ed-b190-ea4934f9883e";

module.exports = {
  sendReqToTranferService,
  sendReqToWarehouseService,
  getProductByItemId,
  getOrderById,
  getAllOrders,
  getUserById,
};

const transferServiceExample = {
  orderId: "ODtest",
  warehouse: {
    address: {
      ward: "1A0302",
      district: "1488",
      province: "201",
      detail: "Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội",
    },
  },
  receiver: {
    name: "Nguyễn Văn A",
    phone: "0353754098",
    address: {
      ward: "1A0302",
      district: "1488",
      province: "201",
      detail:
        "Số nhà 40, ngõ 12, Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội",
    },
  },
  cod: 350000,
  weight: 1000,
  products: [
    {
      id: "1234567890",
      name: "Product 1",
      color: "red",
      size: "M",
      price: 100000,
      quantity: "2",
    },
    {
      id: "1234567891",
      name: "Product 2",
      color: "blue",
      size: "L",
      price: 150000,
      quantity: "1",
    },
    {
      id: "1234567892",
      name: "Product 3",
      color: "black",
      size: "S",
      price: 100000,
      quantity: "1",
    },
  ],
};
