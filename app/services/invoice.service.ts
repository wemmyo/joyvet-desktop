import Invoice, { IInvoice } from '../models/invoice';

export const getInvoices = async (args) => {
  return Invoice.findAll({
    ...args,
  }).then((data: IInvoice[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getInvoiceById = (id: number, args?) => {
  return Invoice.findByPk(id, {
    ...args,
  }).then((data: IInvoice) => {
    return data;
  });
};

export const updateInvoice = (id: number, invoice: Partial<IInvoice>) => {
  return Invoice.update(invoice, {
    where: {
      id,
    },
  }).then((data: IInvoice) => {
    return data;
  });
};

export const deleteInvoice = (id: number) => {
  return Invoice.destroy({
    where: {
      id,
    },
  }).then((data: IInvoice) => {
    return data;
  });
};

export const createInvoice = (invoice: Partial<IInvoice>) => {
  return Invoice.create(invoice).then((data: IInvoice) => {
    return data;
  });
};
