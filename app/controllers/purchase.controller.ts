import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import Purchase from '../models/purchase';
import Supplier from '../models/supplier';
import Product from '../models/product';
import sequelize from '../utils/database';

import {
  getPurchases as getPurchasesService,
  getPurchaseById,
} from '../services/purchase.service';

export const searchPurchaseFn = async (value: string) => {
  // use zod to validate input
  const searchPurchaseSchema = z.object({
    value: z.string().min(1),
  });

  try {
    searchPurchaseSchema.parse({ value });

    const purchases = await getPurchasesService({
      where: {
        invoiceNumber: {
          [Op.startsWith]: value,
        },
      },
      include: [
        {
          model: Supplier,
        },
      ],
    });
    return purchases;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSinglePurchaseFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const getSinglePurchaseSchema = z.object({
    id: z.number(),
  });

  try {
    getSinglePurchaseSchema.parse({ id });

    const purchase = await getPurchaseById(id, {
      include: [
        { model: Supplier },
        {
          model: Product,
        },
      ],
    });
    if (cb) {
      cb();
    }
    return purchase;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPurchasesFn = async () => {
  try {
    const purchases = await getPurchasesService({
      include: [
        {
          model: Supplier,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return purchases;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createPurchaseFn = async (
  values: any,
  meta?: any,
  cb?: () => void
) => {
  // use zod to validate input
  const createPurchaseSchema = z.object({
    values: z.array(z.any()),
    meta: z.object({
      supplierId: z.number(),
      invoiceNumber: z.string().min(1),
      amount: z.number(),
    }),
  });

  try {
    createPurchaseSchema.parse({ values, meta });
    await sequelize.transaction(async (t) => {
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';

      const supplier = await Supplier.findByPk(meta.supplierId);
      const prodArr: any = [];

      const purchase = await supplier.createPurchase(
        {
          invoiceNumber: meta.invoiceNumber,
          amount: meta.amount,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Promise.all(
        values.map(async (each: any) => {
          const prod = await Product.findByPk(each.id);
          await Product.increment('stock', {
            by: each.quantity,
            where: { id: each.id },
            transaction: t,
          });
          await Product.update(
            {
              buyPrice: each.unitPrice,
              sellPrice: each.newSellPrice,
              sellPrice2: each.newSellPrice2,
              sellPrice3: each.newSellPrice3,
            },
            {
              where: {
                id: each.id,
              },
              transaction: t,
            }
          );
          prod.purchaseItem = {
            quantity: each.quantity,
            unitPrice: each.unitPrice,
            amount: each.amount,
            sellPrice: each.newSellPrice,
            sellPrice2: each.newSellPrice2,
            sellPrice3: each.newSellPrice3,
            oldBuyPrice: each.buyPrice,
            oldSellPrice: each.sellPrice,
            oldSellPrice2: each.sellPrice2,
            oldSellPrice3: each.sellPrice3,
            oldStockLevel: each.stock,
          };
          prodArr.push(prod);
        })
      );
      await purchase.addProducts(prodArr, { transaction: t });
      await Supplier.increment('balance', {
        by: meta.amount,
        where: { id: meta.supplierId },
        transaction: t,
      });
    });
    toast.success('Purchase created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deletePurchaseFn = async (
  id: string | number,
  cb?: () => void
) => {
  // use zod to validate input
  const deletePurchaseSchema = z.object({
    id: z.number(),
  });
  try {
    deletePurchaseSchema.parse({ id });
    await sequelize.transaction(async (t) => {
      const purchase = await Purchase.findByPk(id, {
        include: [
          {
            model: Product,
          },
        ],
      });

      await Promise.all(
        purchase.products.map(async (each: any) => {
          await Product.update(
            {
              buyPrice: each.purchaseItem.oldBuyPrice,
              sellPrice: each.purchaseItem.oldSellPrice,
              sellPrice2: each.purchaseItem.oldSellPrice2,
              sellPrice3: each.purchaseItem.oldSellPrice3,
            },
            { where: { id: each.id }, transaction: t }
          );

          await Product.decrement('stock', {
            by: each.purchaseItem.quantity,
            where: { id: each.id },
            transaction: t,
          });
        })
      );

      await Supplier.decrement('balance', {
        by: purchase.amount,
        where: { id: purchase.supplierId },
        transaction: t,
      });

      await purchase.destroy({ transaction: t });

      // dispatch(getPurchasesSuccess((invoices)));
    });
    toast.success('Purchase deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
