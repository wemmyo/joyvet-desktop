import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import Receipt from '../models/receipt';
import Customer from '../models/customer';
import sequelize from '../utils/database';
import { getReceipts as getReceiptsService } from '../services/receipt.service';

export const searchReceiptFn = async (value: string) => {
  // use zod to validate input
  const SearchReceiptSchema = z.object({
    value: z.string().min(1),
  });
  try {
    SearchReceiptSchema.parse({ value });

    const receipts = await getReceiptsService({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
      include: [
        {
          model: Customer,
        },
      ],
    });
    return receipts;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateReceiptFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate input
  const UpdateReceiptSchema = z.object({
    amount: z.number().min(1),
    customerId: z.number(),
    id: z.number(),
  });

  try {
    UpdateReceiptSchema.parse(values);
    // dispatch(updateReceipt());
    await Receipt.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateReceiptSuccess((updateReceiptResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleReceiptFn = async (
  id: string | number,
  cb?: () => void
) => {
  // use zod to validate input
  const GetSingleReceiptSchema = z.object({
    id: z.number(),
  });

  try {
    GetSingleReceiptSchema.parse({ id });
    const getSingleReceiptResponse = await Receipt.findByPk(id, {
      include: Customer,
    });

    if (cb) {
      cb();
    }
    return getSingleReceiptResponse;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getReceiptsFn = async () => {
  try {
    const receipts = await Receipt.findAll({
      include: [
        {
          model: Customer,
        },
      ],
    });
    return receipts;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteReceiptFn = async (id: string | number) => {
  // use zod to validate input
  const DeleteReceiptSchema = z.object({
    id: z.number(),
  });
  try {
    DeleteReceiptSchema.parse({ id });
    await sequelize.transaction(async (t) => {
      const receipt = await Receipt.findByPk(id);

      // update customers balance
      const updateBalance = await Customer.increment('balance', {
        by: receipt.amount,
        where: {
          id: receipt.customerId,
        },
        transaction: t,
      });

      const deleteReceipt = await receipt.destroy({ transaction: t });

      await Promise.all([updateBalance, deleteReceipt]);

      toast.success('Receipt successfully deleted');
    });
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createReceiptFn = async (values: any, cb?: () => void) => {
  // use zod to validate input
  const CreateReceiptSchema = z.object({
    amount: z.number().min(1),
    customerId: z.number(),
    paymentMethod: z.string().min(1),
  });
  try {
    CreateReceiptSchema.parse(values);
    await sequelize.transaction(async (t) => {
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';
      await Receipt.create(
        {
          customerId: values.customerId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Customer.decrement('balance', {
        by: values.amount,
        where: { id: values.customerId },
        transaction: t,
      });
    });

    toast.success('Receipt successfully created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
