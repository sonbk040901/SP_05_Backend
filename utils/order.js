/**
 *
 * @param {{products: any[], cod: number, ...}[]} parsedOrders
 * @returns {{totalCapital: number, totalPrices: number, totalQuantities: number}}}
 */
const statistics = (parsedOrders) => {
  return parsedOrders.reduce(
    (acc, order) => {
      const { products, cod } = order;
      acc.totalCapital += products.reduce(
        (acc, product) => acc + (product.price - 0),
        0
      );
      acc.totalPrices += cod;
      acc.totalQuantities += products.reduce(
        (acc, product) => acc + (product.quantity - 0),
        0
      );
      return acc;
    },
    {
      totalCapital: 0,
      totalPrices: 0,
      totalQuantities: 0,
    }
  );
};
/**
 *
 * @param {{products: any[], cod: number, createdAt: string, ...}[]} parsedOrders
 */
const statisticsYear = (parsedOrders) => {
  /**
   * @type {{month: number, quantity: number, totalCapital: number, totalRevenue: number, totalPrices: number, totalQuantities: number}[]} result
   */
  const result = [];
  for (let i = 0; i < 12; i++) {
    const orders = parsedOrders.filter(
      (order) => new Date(order.createdAt).getMonth() === i
    );
    if (orders.length === 0) continue;
    const { totalCapital, totalPrices, totalQuantities } = statistics(orders);
    result.push({
      month: i + 1,
      quantity: orders.length,
      totalCapital,
      totalRevenue: totalCapital + totalPrices,
      totalPrices,
      totalQuantities,
    });
  }
  return result;
};
/**
 *
 * @param {orderExample} order
 * @returns
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
/**
 *
 * @param {orderExample[]} orders
 * @returns
 */
const parseMultiOrder = async (orders) => {
  const parsedOrders = await Promise.all(
    orders.map(async (order) => {
      let o = await parseOrder(order);
      return o;
    })
  );
  return parsedOrders;
};
/**
 *
 * @param {orderExample} order
 * @returns
 */
const parseRequestTranferService = async (order) => {
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
module.exports = {
  statistics,
  statisticsYear,
  parseOrder,
  parseMultiOrder,
  parseRequestTranferService,
  parseRequestWarehouseService,
  orderExample, //as type
};
