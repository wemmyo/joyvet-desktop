import Payment, { IPayment } from '../models/payment';

export const getPayments = (args) => {
  return Payment.findAll({
    ...args,
    raw: true,
  }).then((data: IPayment[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getPaymentById = (id: number, args) => {
  return Payment.findByPk(id, {
    ...args,
    raw: true,
  }).then((data: IPayment) => {
    return data;
  });
};

export const updatePayment = (id: number, payment: Partial<IPayment>) => {
  return Payment.update(payment, {
    where: {
      id,
    },
  }).then((data: IPayment) => {
    return data;
  });
};

export const deletePayment = (id: number) => {
  return Payment.destroy({
    where: {
      id,
    },
  }).then((data: IPayment) => {
    return data;
  });
};

export const createPayment = (payment: Partial<IPayment>) => {
  return Payment.create(payment).then((data: IPayment) => {
    return data;
  });
};
