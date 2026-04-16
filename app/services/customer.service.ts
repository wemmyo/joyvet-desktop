import type { FindOptions, Transaction } from 'sequelize';

import Customer, { type ICustomer } from '../models/customer';

export const getCustomers = (args: FindOptions) => {
  return Customer.findAll({
    ...args,
  }).then((data: ICustomer[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getCustomerById = (id: number) => {
  return Customer.findByPk(id, {}).then((data: ICustomer) => {
    return data;
  });
};

export const updateCustomer = (
  id: number,
  customer: Partial<ICustomer>,
  transaction?: Transaction
) => {
  return Customer.update(customer, {
    where: {
      id,
    },
    transaction,
  }).then((data: ICustomer) => {
    return data;
  });
};

export const deleteCustomer = (id: number) => {
  return Customer.destroy({
    where: {
      id,
    },
  }).then((data: ICustomer) => {
    return data;
  });
};

export const createCustomer = (customer: Partial<ICustomer>) => {
  return Customer.create(customer).then((data: ICustomer) => {
    return data;
  });
};
