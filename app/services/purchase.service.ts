import Purchase, { IPurchase } from '../models/purchase';

export const getPurchases = (args) => {
  return Purchase.findAll({
    ...args,
    raw: true,
  }).then((data: IPurchase[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getPurchaseById = (id: number) => {
  return Purchase.findByPk(id, {
    raw: true,
  }).then((data: IPurchase) => {
    return data;
  });
};

export const updatePurchase = (id: number, purchase: Partial<IPurchase>) => {
  return Purchase.update(purchase, {
    where: {
      id,
    },
  }).then((data: IPurchase) => {
    return data;
  });
};

export const deletePurchase = (id: number) => {
  return Purchase.destroy({
    where: {
      id,
    },
  }).then((data: IPurchase) => {
    return data;
  });
};

export const createPurchase = (purchase: Partial<IPurchase>) => {
  return Purchase.create(purchase).then((data: IPurchase) => {
    return data;
  });
};
