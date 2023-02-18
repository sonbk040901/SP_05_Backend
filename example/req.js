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
  const body = await parseRequestTranferService(order);
  console.log(body);
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
  const body = await parseRequestWarehouseService(order);
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
const parseRequestTranferService = async (order = orderExample) => {
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
 * @param {{type: string,year: number,month: number}} query
 * @returns {Promise<[orderExample]>}
 */
const getAllOrders = async ({ type, year, month, status }) => {
  /** @type {{data: [orderExample]}} */
  let response;
  try {
    if (BASE_URL_ORDER) {
      response = await axios.get(BASE_URL_ORDER + "listOrderByUser/21");
    } else {
      let res1 = JSON.parse(
        fs.readFileSync(
          path.join(__dirname.replace("example", "mock/mock.json"), ""),
          "utf8"
        )
      );
      response = { data: res1 };
    }
    let data = response.data;
    if (type) {
      data = data.filter((order) => {
        let date = new Date(order.completed_at);
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
/**
 *
 * @param {orderExample} order
 */
const parseOrder = async (order) => {
  const {
    orderId,
    status,
    payment_method,
    userId,
    created_at,
    update_at,
    shiptime_start_at,
    completed_at,
    paytime,
    order_time,
    DistrictID,
    ProvinceID,
    WardCode,
    detailAddress,
    total_price: cod,
    weigth,
    products,
  } = order;
  // let res = await axios.get(API_GET_PROVINCE, {
  //   headers: {
  //     token: ACCESS_TOKEN_GET_PDW,
  //   },
  // });
  // const province = res.data.data.find(
  //   (data) => data.ProvinceID == ProvinceID
  // )?.ProvinceName;
  // res = await axios.get(API_GET_DISTRIC, {
  //   headers: {
  //     token: ACCESS_TOKEN_GET_PDW,
  //   },
  //   params: {
  //     province_id: ProvinceID,
  //   },
  // });
  // const district = res.data.data.find(
  //   (data) => data.DistrictID == DistrictID
  // )?.DistrictName;
  // res = await axios.get(API_GET_WARD, {
  //   headers: {
  //     token: ACCESS_TOKEN_GET_PDW,
  //   },
  //   params: {
  //     district_id: DistrictID,
  //   },
  // });
  // const ward = res.data.data.find(
  //   (data) => data.WardCode == WardCode
  // )?.WardName;
  const receiver = {
    userId,
    address: {
      ward: WardCode,
      district: DistrictID,
      province: ProvinceID,
      detail: detailAddress,
    },
  };

  return {
    orderId,
    receiver,
    products,
    status,
    payment_method,
    cod: Math.floor(cod / 1000) * 1000,
    createdAt: created_at,
    updateAt: update_at,
    startAt: shiptime_start_at,
    completedAt: completed_at,
    payAt: paytime,
    orderAt: order_time,
  };
};
module.exports = {
  sendReqToTranferService,
  sendReqToWarehouseService,
  getProductByItemId,
  getOrderById,
  getAllOrders,
  parseOrder,
  getUserById,
};

const orderExample = {
  orderId: 2,
  status: "thành công",
  payment_method: "momo",
  userId: 21,
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
