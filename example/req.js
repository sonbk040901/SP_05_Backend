const axios = require("axios");
const { response } = require("express");
const sendReqToTranferService = async (order) => {
  const body = parseRequestTranferService(order);
  try {
    const response = await axios.post(
      "http://tungsnk.tech:8082/api/shipping_order",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    if (!data.result.ok) {
      throw new Error(data.result.message);
    }
    return data;
  } catch (error) {
    throw new Error(
      (error.message ||
        error.response.data.error ||
        error.response.data.result) + " from transfer service"
    );
  }
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
    throw new Error(error.response.data.message + " from warehouse service");
  }
};
const parseRequestTranferService = (order) => {
  const {
    id: orderId,
    warehouse = {
      address: {
        ward: "1A0302",
        district: "1488",
        province: "201",
        detail: "Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội",
      },
    },
    customer: receiver,
    total,
    cod = total,
    weigth = 0,
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
      quantity: quantity.toString(),
    };
  });
  const body = { orderId, warehouse, receiver, cod, weigth, products };
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
