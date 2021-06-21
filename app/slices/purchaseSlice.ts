import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import Purchase from '../models/purchase';
import Supplier from '../models/supplier';
import Product from '../models/product';
import sequelize from '../utils/database';

const initialState = {
  singlePurchase: {
    loading: false,
    data: '',
  },
  purchases: {
    loading: false,
    data: '',
  },
  createPurchaseState: {
    loading: false,
    data: '',
  },
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    getSinglePurchase: (state) => {
      const { singlePurchase } = state;
      singlePurchase.loading = true;
    },
    getSinglePurchaseSuccess: (state, { payload }) => {
      const { singlePurchase } = state;
      singlePurchase.loading = false;
      singlePurchase.data = payload;
    },
    getSinglePurchaseFailed: (state) => {
      const { singlePurchase } = state;
      singlePurchase.loading = false;
      singlePurchase.data = '';
    },
    getPurchases: (state) => {
      const { purchases } = state;
      purchases.loading = true;
    },
    getPurchasesSuccess: (state, { payload }) => {
      const { purchases } = state;
      purchases.loading = false;
      purchases.data = payload;
    },
    getPurchasesFailed: (state) => {
      const { purchases } = state;
      purchases.loading = false;
      purchases.data = '';
    },
    createPurchase: (state) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = true;
      createPurchaseState.data = '';
    },
    createPurchaseSuccess: (state, { payload }) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = false;
      createPurchaseState.data = payload;
    },
    createPurchaseFailed: (state) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = false;
    },
  },
});

export const {
  getSinglePurchase,
  getSinglePurchaseSuccess,
  getSinglePurchaseFailed,
  getPurchases,
  getPurchasesSuccess,
  getPurchasesFailed,
  createPurchase,
  createPurchaseSuccess,
  createPurchaseFailed,
} = purchaseSlice.actions;

export const searchPurchaseFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const purchases = await Purchase.findAll({
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
    dispatch(getPurchasesSuccess(JSON.stringify(purchases)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSinglePurchaseFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSinglePurchase());

    const getSinglePurchaseResponse = await Purchase.findByPk(id, {
      include: [
        { model: Supplier },
        {
          model: Product,
        },
      ],
    });

    dispatch(
      getSinglePurchaseSuccess(JSON.stringify(getSinglePurchaseResponse))
    );
    if (cb) {
      cb();
    }
    console.log(getSinglePurchaseResponse);
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPurchasesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPurchases());
    const purchases = await Purchase.findAll({
      include: [
        {
          model: Supplier,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    dispatch(getPurchasesSuccess(JSON.stringify(purchases)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createPurchaseFn = (
  values: any,
  meta?: any,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    await sequelize.transaction(async (t) => {
      dispatch(createPurchase());
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
      toast.success('Purchase created');
      if (cb) {
        cb();
      }
      dispatch(createPurchaseSuccess({}));
    });
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deletePurchaseFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
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

      await purchase.destroy({ transaction: t });

      toast.success('Purchase deleted');

      // dispatch(getPurchasesSuccess(JSON.stringify(invoices)));
      if (cb) {
        cb();
      }
    });
  } catch (error) {
    console.log(error);

    toast.error(error.message || '');
  }
};

export const selectPurchaseState = (state: any) => state.purchase;

export default purchaseSlice.reducer;
