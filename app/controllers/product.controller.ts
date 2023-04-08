import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import moment from 'moment';

import {
  getProducts as getProductsService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  getProductById,
} from '../services/product.service';
import { getPurchaseItems as getPurchaseItemsService } from '../services/purchaseItem.service';
import { getInvoices as getInvoicesService } from '../services/invoice.service';

import type { IProduct } from '../models/product';

export const getProductPurchasesFn = async (
  productId: string | number,
  startDate?: Date | string,
  endDate?: Date | string
) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
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
  productId: string,
  startDate: Date | string,
  endDate: Date | string
) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
  });
  try {
    schema.parse({ productId, startDate, endDate });

    const invoices = await getInvoicesService({
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
  // use zod to validate input
  const schema = z.object({
    values: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      price: z.number(),
      quantity: z.number(),
      category: z.string().min(1),
    }),
    id: z.number(),
  });
  try {
    schema.parse({ values, id });
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

export const createProductFn = async (values: any, cb?: () => void) => {
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
