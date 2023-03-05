import Product, { IProduct } from '../models/product';

export const getProducts = (args) => {
  return Product.findAll({
    ...args,
    raw: true,
  }).then((data: IProduct[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getProductById = (id: number) => {
  return Product.findByPk(id, {
    raw: true,
  }).then((data: IProduct) => {
    return data;
  });
};

export const updateProduct = (id: number, product: Partial<IProduct>) => {
  return Product.update(product, {
    where: {
      id,
    },
  }).then((data: IProduct) => {
    return data;
  });
};

export const deleteProduct = (id: number) => {
  return Product.destroy({
    where: {
      id,
    },
  }).then((data: IProduct) => {
    return data;
  });
};

export const createProduct = (product: Partial<IProduct>) => {
  return Product.create(product).then((data: IProduct) => {
    return data;
  });
};
