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

export const getSupplierPaymentsFn = async (
  supplierId: string | number,
  startDate?: Date | string,
  endDate?: Date | string
) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
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
  supplierId: string,
  startDate: Date | string,
  endDate: Date | string
) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
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
    // dispatch(updateCustomer());
    await deleteSupplierService(id);
    // dispatch(updateCustomerSuccess((updateCustomerResponse)));
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
    phoneNumber: z.string().min(1),
    email: z.string().min(1),
    address: z.string().min(1),
  });
  try {
    // dispatch(updateSupplier());
    schema.parse({ ...values, id });
    await updateSupplierService(id, values);
    // dispatch(updateSupplierSuccess((updateSupplierResponse)));
    toast.success('Successfully updated');
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

export const createSupplierFn = async (values: any, cb?: () => void) => {
  // use zod to validate input
  const schema = z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
  });
  try {
    schema.parse(values);
    // const response = await Supplier.create(values);
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await createSupplierService({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || 0,
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
