const createInvoiceChecks = () => {
  const values = [
    {
      id: 8146,
      title: 'SCOOP NET LONG',
      stock: 2,
      sellPrice: 5000,
      sellPrice2: 4950,
      sellPrice3: 4900,
      buyPrice: 4200,
      reorderLevel: 5,
      productCode: 'SO34',
      numberInPack: 'NULL',
      postedBy: '2017-09-29 00:00:00',
      createdAt: '2017-09-29T00:00:00.000Z',
      updatedAt: null,
      quantity: 1,
      amount: 5000,
      unitPrice: 5000,
      orderId: 363,
      profit: 800,
    },
    {
      id: 8388,
      title: 'ESSENTIAL VITAMIN',
      stock: 9,
      sellPrice: 3300,
      sellPrice2: 3280,
      sellPrice3: 3250,
      buyPrice: 3000,
      reorderLevel: 5,
      productCode: 'VT56',
      numberInPack: 'NULL',
      postedBy: '2020-09-23 00:00:00',
      createdAt: '2020-09-23T00:00:00.000Z',
      updatedAt: null,
      quantity: 2,
      amount: 6600,
      unitPrice: 3300,
      orderId: 428,
      profit: 600,
    },
  ];
  const meta = {
    customerId: '397',
    saleType: 'cash',
    amount: 11600,
    profit: 1400,
  };

  //  If an item is out of stock
  //  If quantity * unitPrice !== Amount
  //  If total doesn't add up
  //  If length of invoice Items < 1
  //  If not saleType
  //  If not customer
  //  For each product if not quantity, unitPrice,Amount
};
