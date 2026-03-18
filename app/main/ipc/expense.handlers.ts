import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import ExpenseType from '../../models/expenseType';
import {
  getExpenseById,
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
} from '../../services/expense.service';

const expenseInputSchema = z.object({
  type: z.string().min(1),
  amount: z.number().min(0),
  date: z.date(),
  note: z.string().optional().nullable(),
});

export function registerExpenseHandlers(): void {
  ipcMain.handle('expense:getAll', async () => {
    const expenses = await getExpenses({});
    return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
  });

  ipcMain.handle('expense:getById', async (_event, id: number) => {
    z.number().parse(id);
    const expense = await getExpenseById(id);

    if (!expense) {
      throw new Error('Expense not found');
    }

    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  });

  ipcMain.handle('expense:create', async (_event, values: any) => {
    const parsedValues = z.object({
      type: z.string().min(1),
      amount: z.coerce.number(),
      date: z.string().min(1),
      note: z.string().optional().nullable(),
    }).parse(values);

    const expense = await createExpense({
      ...parsedValues,
      date: new Date(parsedValues.date),
      note: parsedValues.note || undefined,
      postedBy: values.postedBy || null,
    });
    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  });

  ipcMain.handle('expense:update', async (_event, id: number, values: any) => {
    z.number().parse(id);
    const parsedValues = expenseInputSchema.parse(values);
    await updateExpense(
      id,
      {
        ...parsedValues,
        note: parsedValues.note || undefined,
      }
    );
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

  ipcMain.handle('expense:search', async (_event, value: string) => {
    z.string().min(1).parse(value);

    const expenses = await getExpenses({
      where: {
        [Op.or]: [
          { type: { [Op.substring]: value } },
          { note: { [Op.substring]: value } },
        ],
      },
      order: [['date', 'DESC']],
    });

    return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
  });

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
