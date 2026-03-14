import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from '../../services/customer.service';
import { getReceipts } from '../../services/receipt.service';
import { getInvoices } from '../../services/invoice.service';

export function registerCustomerHandlers(): void {
  ipcMain.handle('customer:getAll', async () => {
    const customers = await getCustomers({ order: [['fullName', 'ASC']] });
    return customers.map((c: any) => (c.toJSON ? c.toJSON() : c));
  });

  ipcMain.handle('customer:getById', async (_event, id: number) => {
    const customer = await getCustomerById(id);
    return (customer as any).toJSON ? (customer as any).toJSON() : customer;
  });

  ipcMain.handle('customer:create', async (_event, values: any) => {
    const schema = z.object({
      values: z.object({
        fullName: z.string().min(1),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
      }),
    });
    schema.parse({ values });
    const customer = await createCustomer({ ...values, id: Date.now() });
    return (customer as any).toJSON ? (customer as any).toJSON() : customer;
  });

  ipcMain.handle('customer:update', async (_event, id: number, values: any) => {
    await updateCustomer(id, values);
  });

  ipcMain.handle('customer:delete', async (_event, id: number) => {
    await deleteCustomer(id);
  });

  ipcMain.handle('customer:search', async (_event, value: string) => {
    const schema = z.object({ value: z.string().min(1) });
    schema.parse({ value });
    const customers = await getCustomers({
      where: { fullName: { [Op.substring]: value } },
    });
    return customers.map((c: any) => (c.toJSON ? c.toJSON() : c));
  });

  ipcMain.handle(
    'customer:getInvoices',
    async (_event, customerId: number, startDate: string, endDate: string) => {
      const invoices = await getInvoices({
        where: {
          customerId,
          createdAt: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return invoices.map((i: any) => (i.toJSON ? i.toJSON() : i));
    }
  );

  ipcMain.handle(
    'customer:getReceipts',
    async (
      _event,
      customerId: number,
      startDate?: string,
      endDate?: string
    ) => {
      const receipts = await getReceipts({
        where: {
          customerId,
          createdAt: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return receipts.map((r: any) => (r.toJSON ? r.toJSON() : r));
    }
  );
}
