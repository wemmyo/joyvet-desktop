import { sum } from '../utils/helpers';

// const values = [
//   {
//     id: 8146,
//     title: 'SCOOP NET LONG',
//     stock: 2,
//     sellPrice: 5000,
//     sellPrice2: 4950,
//     sellPrice3: 4900,
//     buyPrice: 4200,
//     reorderLevel: 5,
//     productCode: 'SO34',
//     numberInPack: 'NULL',
//     postedBy: '2017-09-29 00:00:00',
//     createdAt: '2017-09-29T00:00:00.000Z',
//     updatedAt: null,
//     quantity: 1,
//     amount: 5000,
//     unitPrice: 5000,
//     orderId: 363,
//     profit: 800,
//   },
//   {
//     id: 8388,
//     title: 'ESSENTIAL VITAMIN',
//     stock: 9,
//     sellPrice: 3300,
//     sellPrice2: 3280,
//     sellPrice3: 3250,
//     buyPrice: 3000,
//     reorderLevel: 5,
//     productCode: 'VT56',
//     numberInPack: 'NULL',
//     postedBy: '2020-09-23 00:00:00',
//     createdAt: '2020-09-23T00:00:00.000Z',
//     updatedAt: null,
//     quantity: 2,
//     amount: 6600,
//     unitPrice: 3300,
//     orderId: 428,
//     profit: 600,
//   },
// ];
// const meta = {
//   customerId: '397',
//   saleType: 'cash',
//   amount: 11600,
//   profit: 1400,
// };

export const createInvoiceValidation = (values, meta) => {
  //  If an item is out of stock
  if (values.length < 0) {
    throw new Error('Products validation failed');
  }
  //  If quantity * unitPrice !== Amount
  //  If total doesn't add up
  const sumOfOrders = (orders: any[]) => {
    if (orders.length === 0) {
      return 0;
    }
    return orders
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };
  if (sumOfOrders(values) !== meta.amount) {
    throw new Error("Amount doesn't add up in validation");
  }

  //  For each product if not quantity, unitPrice,Amount
  values.forEach((each) => {
    if (!each.quantity) {
      throw new Error('Each quantity validation failed');
    } else if (!each.amount) {
      throw new Error('Each amount validation failed');
    } else if (each.quantity * each.unitPrice !== each.amount) {
      throw new Error("Product of quantity and unit price doesn't add up");
    }
  });
};

export const test = () => {};
