import Supplier, { ISupplier } from '../models/supplier';

export const getSuppliers = (args) => {
  return Supplier.findAll({
    ...args,
    raw: true,
  }).then((data: ISupplier[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getSupplierById = (id: number) => {
  return Supplier.findByPk(id, {
    raw: true,
  }).then((data: ISupplier) => {
    return data;
  });
};

export const updateSupplier = (id: number, supplier: Partial<ISupplier>) => {
  return Supplier.update(supplier, {
    where: {
      id,
    },
  }).then((data: ISupplier) => {
    return data;
  });
};

export const deleteSupplier = (id: number) => {
  return Supplier.destroy({
    where: {
      id,
    },
  }).then((data: ISupplier) => {
    return data;
  });
};

export const createSupplier = (supplier: Partial<ISupplier>) => {
  return Supplier.create(supplier).then((data: ISupplier) => {
    return data;
  });
};
