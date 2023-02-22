const axios = require("axios");
const fs = require("fs");
const { response } = require("express");
const path = require("path");
const BASE_URL_TRANSFER = process.env.BASE_URL_TRANSFER;
const BASE_URL_WAREHOUSE = process.env.BASE_URL_WAREHOUSE;
const BASE_URL_PRODUCTION = process.env.BASE_URL_PRODUCTION;
const BASE_URL_ORDER = process.env.BASE_URL_ORDER || "";
const BASE_URL_USER = process.env.BASE_URL_USER || "";
const sendReqToTranferService = async (order) => {
  try {
    const body = await parseRequestTranferService(order);
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
const sendRedeliverReqToTranferService = async (order) => {
  try {
    const body = await parseRequestTranferService(order);
    const response = await axios.put(
      BASE_URL_TRANSFER + `shipping_order/redeliver/${order.orderId}`,
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
const sendReturnReqToTranferService = async (order) => {
  try {
    const body = await parseRequestTranferService(order);
    const response = await axios.put(
      BASE_URL_TRANSFER + `shipping_order/return/${order.orderId}`,
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
  try {
    const body = await parseRequestWarehouseService(order);
    const response = await axios.post(BASE_URL_WAREHOUSE + "export", body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data;
    return data;
  } catch (error) {
    throw new Error(
      (error.response.data?.message || error.response.data?.error) +
        " from warehouse service"
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
 * @returns {Promise<Order>}
 */
const getOrderById = async (orderId) => {
  let response;
  let url;
  try {
    url = BASE_URL_ORDER + `getOrderById/${orderId}`;
    if (BASE_URL_ORDER) response = await axios.get(url);
    else response = { data: { ...orderExample, orderId } };
    const data = response.data[0];
    // console.log(response.data);
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
  /** @type {{data: Order[]}} */
  let response;
  try {
    if (BASE_URL_ORDER) {
      response = await axios.get(BASE_URL_ORDER + "listOrder");
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
          status = "chờ xác nhận";
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

/**
 * @param {number} orderId
 * @param {string} status
 */
const updateOrderStatus = async (orderId, status) => {
  /**
   * @type {{data: any}}
   */
  let response;
  try {
    if (BASE_URL_ORDER) {
      let url = BASE_URL_ORDER + `UpdateOrderStatus/${orderId}`;
      response = await axios.post(url, {
        newStatus: status,
      });
      return response.data;
    }
    return { message: "success" };
  } catch (error) {
    throw new Error(error + " from order service");
  }
};

const getUserById = async (userId) => {
  let url = BASE_URL_USER + `user`;
  let response;
  try {
    response = await axios.get(url);
    const users = response.data;
    const user = users.find((user) => user.id == userId);
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw new Error(error.message + "from user service");
  }
};

/**
 *
 * @param {Order} order
 * @returns
 */
const parseRequestTranferService = async (order) => {
  try {
    const {
      orderId,
      warehouse = {
        address: {
          ward: "1A0302",
          district: "1488",
          province: "201",
          detail: "Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội",
        },
      },
      // name = "Nguyễn Văn A",
      // phone = "0123456789",
      DistrictID,
      ProvinceID,
      WardCode,
      detailAddress,
      total,
      total_price: cod,
      weigth = 0,
      products: details,
    } = order;
    const user = await getUserById(order.userId);
    const receiver = {
      name: user.name,
      phone: user.phoneNumber,
      address: {
        ward: WardCode,
        district: DistrictID,
        province: ProvinceID,
        detail: detailAddress,
      },
    };
    const products = details.map((detail) => {
      const {
        productId: id,
        productName: name,
        productStatus: status,
        price,
        quantity,
        img,
        size,
        color,
      } = detail;
      return {
        id,
        name,
        status,
        price,
        quantity,
        img,
        size,
        color,
      };
    });
    const body = { orderId, warehouse, receiver, cod, weigth, products };
    return body;
  } catch (error) {
    throw new Error(error);
  }
};
const parseRequestWarehouseService = async (order) => {
  const { products = [] } = order;
  const product = (await getProductByItemId(products[0].productId)).data;
  const productId = product.product_id;
  const items = products.map((product) => {
    const { productId: itemId, quantity } = product;
    return {
      productId,
      itemId,
      quantity,
      goodQuantity: 1,
      badQuantity: 0,
    };
  });
  return {
    items,
  };
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
  sendRedeliverReqToTranferService,
  sendReturnReqToTranferService,
  sendReqToWarehouseService,
  getProductByItemId,
  getOrderById,
  getAllOrders,
  getUserById,
  updateOrderStatus,
  parseRequestTranferService,
  parseRequestWarehouseService,
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
const orderExample = {
  orderId: 2,
  status: "thành công",
  payment_method: "momo",
  userId: 3,
  created_at: "1998-12-31 15:30:28",
  update_at: "1998-12-31 15:30:56",
  shiptime_start_at: "1999-01-01 02:30:28",
  completed_at: "1999-01-01 02:45:00",
  paytime: "1999-01-01 02:55:28",
  order_time: "1998-12-31 15:50:00",
  DistrictID: "1488",
  ProvinceID: "201",
  WardCode: "1A0302",
  detailAddress: "hai ba trung ha noi",
  total_price: 190000,
  comment: "",
  rate: "",
  products: [
    {
      productId: 4,
      productName: "Vở Campus",
      productStatus: "1",
      price: "20000",
      quantity: 3,
      img: "https://ngoclanvpp.vn/User_folder_upload/admin/images/Vo-Campus-NB-BDAW120-2-120-trang.jpeg",
      size: "80Tr",
      color: "Hồng",
    },
    {
      productId: 5,
      productName: "Tai nghe",
      productStatus: "1",
      price: "100000",
      quantity: 1,
      img: "https://cdn.nguyenkimmall.com/images/detailed/605/10042790-tai-nghe-bluetooth-prolink-phb6003e-den-do-1.jpg",
      size: "2XL",
      color: "Đen",
    },
  ],
};
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
