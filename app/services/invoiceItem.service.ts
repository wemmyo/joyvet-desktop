import InvoiceItem, { type IInvoiceItem } from '../models/invoiceItem';

export const getInvoiceItems = (args: any) => {
  return InvoiceItem.findAll({
    ...args,
  }).then((data: IInvoiceItem[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getInvoiceItemById = (id: number) => {
  return InvoiceItem.findByPk(id, {}).then((data: IInvoiceItem) => {
    return data;
  });
};
