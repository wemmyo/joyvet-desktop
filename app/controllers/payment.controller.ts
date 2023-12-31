import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import Payment, { IPayment } from '../models/payment';
import Supplier from '../models/supplier';
import sequelize from '../utils/database';
import {
  getPayments as getPaymentsService,
  getPaymentById,
  updatePayment as updatePaymentService,
} from '../services/payment.service';

export const searchPaymentFn = async (value: string) => {
  // use zod to validate input
  const searchPaymentSchema = z.object({
    value: z.string().min(1),
  });
  try {
    searchPaymentSchema.parse({ value });
    const payments = await getPaymentsService({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
    });
    return payments;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updatePaymentFn = async (
  values: Partial<IPayment>,
  id: number,
  cb?: () => void
) => {
  // use zod to validate input
  const updatePaymentSchema = z.object({
    id: z.number(),
    values: z.object({
      amount: z.number().min(1),
      supplierId: z.number(),
      paymentDate: z.string().min(1),
    }),
  });
  try {
    updatePaymentSchema.parse({ id, values });

    await updatePaymentService(id, values);

    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSinglePaymentFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const getSinglePaymentSchema = z.object({
    id: z.number(),
  });
  try {
    getSinglePaymentSchema.parse({ id });
    const payment = await getPaymentById(id, {
      include: Supplier,
    });
    if (cb) {
      cb();
    }

    return payment;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPaymentsFn = async () => {
  try {
    const payments = await getPaymentsService({});
    return payments;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deletePaymentFn = async (id: string | number) => {
  // use zod to validate input
  const deletePaymentSchema = z.object({
    id: z.number(),
  });
  try {
    deletePaymentSchema.parse({ id });
    await sequelize.transaction(async (t) => {
      const payment = await Payment.findByPk(id);

      const updateBalance = await Supplier.increment('balance', {
        by: payment.amount,
        where: { id: payment.supplierId },
        transaction: t,
      });

      const deletePayment = await payment.destroy({ transaction: t });

      await Promise.all([updateBalance, deletePayment]);
    });
    toast.success('Payment successfully deleted');
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createPaymentFn = async (values: any, cb?: () => void) => {
  // use zod to validate input
  const createPaymentSchema = z.object({
    values: z.object({
      amount: z.number().min(1),
      supplierId: z.number(),
      paymentMethod: z.string().min(1),
      bank: z.string(),
    }),
  });
  try {
    createPaymentSchema.parse({ values });
    await sequelize.transaction(async (t) => {
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';

      await Payment.create(
        {
          supplierId: values.supplierId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Supplier.decrement('balance', {
        by: values.amount,
        where: { id: values.supplierId },
        transaction: t,
      });

      toast.success('Payment successfully created');
    });
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
