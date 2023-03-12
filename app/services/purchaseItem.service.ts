import PurchaseItem, { IPurchaseItem } from '../models/purchaseItem';

export const getPurchaseItems = (args) => {
  return PurchaseItem.findAll({
    ...args,
    raw: true,
  }).then((data: IPurchaseItem[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getPurchaseItemById = (id: number) => {
  return PurchaseItem.findByPk(id, {
    raw: true,
  }).then((data: IPurchaseItem) => {
    return data;
  });
};

export const updatePurchaseItem = (
  id: number,
  purchaseItem: Partial<IPurchaseItem>
) => {
  return PurchaseItem.update(purchaseItem, {
    where: {
      id,
    },
  }).then((data: IPurchaseItem) => {
    return data;
  });
};

export const deletePurchaseItem = (id: number) => {
  return PurchaseItem.destroy({
    where: {
      id,
    },
  }).then((data: IPurchaseItem) => {
    return data;
  });
};
