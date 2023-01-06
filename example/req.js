const axios = require("axios");
const { response } = require("express");
const sendReqToTranferService = async (order) => {
  const body = parseRequestTranferService(order);
  return { status: "success", message: "Tranfer success" };
};
const sendReqToWarehouseService = async (order) => {
  const body = parseRequestWarehouseService(order);
  try {
    const response = await axios.post(
      "https://ltct-warehouse-backend.onrender.com/api/export",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};
const parseRequestTranferService = (order) => {
  const {
    id: order_id,
    warehouse = {
      address: {
        ward: "Bách Khoa",
        district: "Hai Bà Trưng",
        province: "Hà Nội",
        detail: "Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội",
      },
    },
    customer: receiver,
    total,
    cod = total,
    details,
  } = order;
  const products = details.map((detail) => {
    const { product, price, quantity } = detail;
    const { product_id: id, name, color, size } = product;
    return {
      id,
      name,
      color,
      size,
      price,
      quantity,
    };
  });
  const body = { order_id, warehouse, receiver, cod, products };
  return body;
};
const parseRequestWarehouseService = (order) => {
  const { details } = order;
  const items = details.map((detail) => {
    const { product, quantity } = detail;
    const { product_id: productId, item_id: itemId } = product;
    return {
      productId,
      itemId,
      quantity,
      goodQuantity: 10,
      badQuantity: 0,
    };
  });
  return {
    items,
  };
};

module.exports = {
  sendReqToTranferService,
  sendReqToWarehouseService,
};
