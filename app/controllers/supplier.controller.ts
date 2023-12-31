import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import Payment from '../models/payment';
import Purchase from '../models/purchase';
import {
  createSupplier as createSupplierService,
  getSupplierById,
  getSuppliers as getSuppliersService,
  deleteSupplier as deleteSupplierService,
  updateSupplier as updateSupplierService,
} from '../services/supplier.service';
import { ISupplier } from '../models/supplier';

export const getSupplierPaymentsFn = async (
  supplierId: number,
  startDate?: string,
  endDate?: string
) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.string(),
    endDate: z.string(),
  });
  try {
    schema.parse({ supplierId, startDate, endDate });
    const payments = await Payment.findAll({
      where: {
        supplierId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    return payments;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSupplierPurchasesFn = async (
  supplierId: number,
  startDate: string,
  endDate: string
) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.string(),
    endDate: z.string(),
  });

  try {
    schema.parse({ supplierId, startDate, endDate });
    const purchases = await Purchase.findAll({
      where: {
        supplierId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    return purchases;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const searchSupplierFn = async (value: string) => {
  // use zod to validate input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });
    const suppliers = await getSuppliersService({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    return suppliers;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteSupplierFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });

  try {
    schema.parse({ id });
    await deleteSupplierService(id);
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateSupplierFn = async (
  values: any,
  id: number,
  cb?: () => void
) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
    fullName: z.string().min(1),
    phoneNumber: z.string(),
    address: z.string(),
  });
  try {
    schema.parse({ ...values, id });
    await updateSupplierService(id, values);
    toast.success('Successfully updated, refresh to see changes', {
      autoClose: 5000,
    });
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleSupplierFn = async (id: number) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    const singleSupplier = await getSupplierById(id);
    return singleSupplier;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSuppliersFn = async () => {
  try {
    const suppliers = await getSuppliersService({
      order: [['fullName', 'ASC']],
    });
    return suppliers;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createSupplierFn = async (
  values: Partial<ISupplier>,
  cb?: () => void
) => {
  // use zod to validate input
  const schema = z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string(),
    address: z.string(),
  });
  try {
    schema.parse(values);
    // const response = await Supplier.create(values);
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    await createSupplierService({
      ...values,
      id: Date.now(),
      postedBy: user.fullName,
    });

    toast.success('Supplier successfully created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
