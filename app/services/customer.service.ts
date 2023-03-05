import Customer, { ICustomer } from '../models/customer';

export const getCustomers = (args) => {
  return Customer.findAll({
    ...args,
    raw: true,
  }).then((data: ICustomer[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getCustomerById = (id: number) => {
  return Customer.findByPk(id, {
    raw: true,
  }).then((data: ICustomer) => {
    return data;
  });
};

export const updateCustomer = (id: number, customer: Partial<ICustomer>) => {
  return Customer.update(customer, {
    where: {
      id,
    },
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
