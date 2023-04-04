import Receipt, { IReceipt } from '../models/receipt';

export const getReceipts = async (args) => {
  return Receipt.findAll({
    ...args,
  }).then((data: IReceipt[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getReceiptById = (id: number) => {
  return Receipt.findByPk(id, {}).then((data: IReceipt) => {
    return data;
  });
};

export const updateReceipt = (id: number, receipt: Partial<IReceipt>) => {
  return Receipt.update(receipt, {
    where: {
      id,
    },
  }).then((data: IReceipt) => {
    return data;
  });
};

export const deleteReceipt = (id: number) => {
  return Receipt.destroy({
    where: {
      id,
    },
  }).then((data: IReceipt) => {
    return data;
  });
};

export const createReceipt = (receipt: Partial<IReceipt>) => {
  return Receipt.create(receipt).then((data: IReceipt) => {
    return data;
  });
};
