import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import ExpenseType from '../../models/expenseType';
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../../services/expense.service';

export function registerExpenseHandlers(): void {
  ipcMain.handle('expense:getAll', async () => {
    const expenses = await getExpenses({});
    return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
  });

  ipcMain.handle('expense:create', async (_event, values: any) => {
    const schema = z.object({
      type: z.string().min(1),
      amount: z.number(),
      date: z.string().min(1),
      note: z.string(),
    });
    schema.parse(values);

    const expense = await createExpense(values);
    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  });

  ipcMain.handle('expense:delete', async (_event, id: number) => {
    const schema = z.object({ id: z.number() });
    schema.parse({ id });
    await deleteExpense(id);
  });

  ipcMain.handle(
    'expense:filter',
    async (_event, startDate: string, endDate: string) => {
      const schema = z.object({
        startDate: z.string().min(1),
        endDate: z.string().min(1),
      });
      schema.parse({ startDate, endDate });

      const expenses = await getExpenses({
        where: {
          date: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
      });
      return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
    }
  );

  ipcMain.handle('expense:getTypes', async () => {
    const types = await ExpenseType.findAll();
    return (types as any[]).map((t: any) => (t.toJSON ? t.toJSON() : t));
  });

  ipcMain.handle('expense:createType', async (_event, values: any) => {
    const schema = z.object({ type: z.string().min(1) });
    schema.parse(values);
    const expenseType = await (ExpenseType as any).create(values);
    return expenseType.toJSON ? expenseType.toJSON() : expenseType;
  });
}
