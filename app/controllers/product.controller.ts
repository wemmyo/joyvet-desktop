import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import moment from 'moment';

import {
  getProducts as getProductsService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  getProductById,
  deleteProduct,
} from '../services/product.service';
import { getPurchaseItems as getPurchaseItemsService } from '../services/purchaseItem.service';

import type { IProduct } from '../models/product';
import { getInvoiceItems } from '../services/invoiceItem.service';

export const getProductPurchasesFn = async (
  productId: number,
  startDate?: Date | string,
  endDate?: Date | string
) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.string(),
    endDate: z.string(),
  });

  try {
    schema.parse({ productId, startDate, endDate });

    const receipts = await getPurchaseItemsService({
      where: {
        productId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    return receipts;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getProductInvoicesFn = async (
  productId: number,
  startDate: string,
  endDate: string
) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.string(),
    endDate: z.string(),
  });
  try {
    schema.parse({ productId, startDate, endDate });

    const invoices = await getInvoiceItems({
      where: {
        productId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    return invoices;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const searchProductFn = async (value: string) => {
  // use zod to validate input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });

    const products = await getProductsService({
      where: {
        title: {
          [Op.substring]: value,
        },
      },
    });
    return products;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateProductFn = async (
  values: Partial<IProduct>,
  id: number,
  cb?: () => void
) => {
  try {
    await updateProductService(id, values);
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleProductFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });

  try {
    schema.parse({ id });

    const product = await getProductById(id);

    if (cb) {
      cb();
    }
    return product;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getProductsFn = async (filter?: 'inStock') => {
  let filters = {};
  if (filter === 'inStock') {
    filters = {
      where: {
        stock: { [Op.gt]: 0 },
      },
    };
  }

  try {
    const products = await getProductsService({
      ...filters,
      order: [['title', 'ASC']],
    });
    return products;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createProductFn = async (
  values: Partial<IProduct>,
  cb?: () => void
) => {
  // use zod to validate input
  const schema = z.object({
    values: z.object({
      title: z.string().min(1),
      sellPrice: z.number(),
      sellPrice2: z.number(),
      sellPrice3: z.number(),
      buyPrice: z.number(),
    }),
  });
  try {
    schema.parse({ values });
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    await createProductService({
      ...values,
      postedBy: user.fullName,
    });

    if (cb) {
      cb();
    }
    toast.success('Successfully created');
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteProductFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    await deleteProduct(id);
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
