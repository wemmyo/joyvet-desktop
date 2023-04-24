import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import { ICustomer } from '../models/customer';

import {
  getCustomers as getCustomersService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService,
  createCustomer as createCustomerService,
  getCustomerById as getCustomerByIdService,
} from '../services/customer.service';

import { getReceipts as getReceiptsService } from '../services/receipt.service';
import { getInvoices as getInvoicesService } from '../services/invoice.service';
import { IInvoice } from '../models/invoice';
import { IReceipt } from '../models/receipt';

export const getCustomerReceiptsFn = async (
  customerId: number,
  startDate?: string,
  endDate?: string
): Promise<IReceipt[]> => {
  let receipts: IReceipt[] = [];

  // use zod to validate the input
  const schema = z.object({
    customerId: z.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });

  try {
    schema.parse({ customerId, startDate, endDate });

    const response = await getReceiptsService({
      where: {
        customerId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    receipts = response;
  } catch (error) {
    toast.error(error.message || '');
  }

  return receipts;
};

export const getCustomerInvoicesFn = async (
  customerId: number,
  startDate: string,
  endDate: string
): Promise<IInvoice[]> => {
  // use zod to validate the input

  let invoices: IInvoice[] = [];

  const schema = z.object({
    customerId: z.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });

  try {
    schema.parse({ customerId, startDate, endDate });

    const response = await getInvoicesService({
      where: {
        customerId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    invoices = response;
  } catch (error) {
    toast.error(error.message || '');
  }
  return invoices;
};

export const searchCustomerFn = async (value: string) => {
  // use zod to validate the input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });
    const customers = await getCustomersService({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    return customers;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteCustomerFn = async (id: number, cb?: () => void) => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    await deleteCustomerService(id);
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateCustomerFn = async (
  values: Partial<ICustomer>,
  id: number,
  cb?: () => void
) => {
  // use zod to validate the input
  const schema = z.object({
    values: z.object({
      fullName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
    }),
    id: z.number(),
  });

  try {
    schema.parse({ values, id });
    await updateCustomerService(id, values);
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleCustomerFn = async (id: number, cb?: () => void) => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });

    const customer = await getCustomerByIdService(id);

    if (cb) {
      cb();
    }
    return customer;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getCustomersFn = async () => {
  try {
    const customers = await getCustomersService({
      order: [['fullName', 'ASC']],
    });

    return customers;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createCustomerFn = async (values: any, cb?: () => void) => {
  // use zod to validate the input
  const schema = z.object({
    values: z.object({
      fullName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
    }),
  });
  try {
    schema.parse({ values });
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    const customer = await createCustomerService({
      fullName: values.fullName,
      address: values.address,
      phoneNumber: values.phoneNumber,
      balance: values.balance,
      postedBy: user.fullName,
    });
    if (cb) {
      cb();
    }
    return customer;
  } catch (error) {
    toast.error(error.message || '');
  }
};
