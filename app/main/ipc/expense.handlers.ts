import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Expense from '../../models/expense';
import ExpenseType from '../../models/expenseType';
import {
  getExpenseById,
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
} from '../../services/expense.service';
import {
  expenseListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { withAppReady } from '../runtime';

const MAX_DATE_RANGE = 90;

const expenseInputSchema = z.object({
  type: z.string().min(1),
  amount: z.number().min(0),
  date: z.date(),
  note: z.string().optional().nullable(),
});

export function registerExpenseHandlers(): void {
  // Paginated list — replaces the old unbounded getAll
  ipcMain.handle('expense:getAll', withAppReady(async (_event, input: unknown = {}) => {
    const query = expenseListQuerySchema.parse(input);
    const { page, pageSize } = query;
    const { rows, count } = await Expense.findAndCountAll({
      ...toPaginationOptions({ page, pageSize }),
      order: [['date', 'DESC']],
    });
    return toPaginatedResult(
      rows.map((e: any) => (e.toJSON ? e.toJSON() : e)),
      count,
      page,
      pageSize
    );
  }));

  ipcMain.handle('expense:getById', withAppReady(async (_event, id: number) => {
    z.number().parse(id);
    const expense = await getExpenseById(id);
    if (!expense) throw new Error('Expense not found');
    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  }));

  ipcMain.handle('expense:create', withAppReady(async (_event, values: any) => {
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
  }));

  ipcMain.handle('expense:update', withAppReady(async (_event, id: number, values: any) => {
    z.number().parse(id);
    const parsedValues = expenseInputSchema.parse(values);
    await updateExpense(id, { ...parsedValues, note: parsedValues.note || undefined });
  }));

  ipcMain.handle('expense:delete', withAppReady(async (_event, id: number) => {
    z.object({ id: z.number() }).parse({ id });
    await deleteExpense(id);
  }));

  // Date-filtered list — now enforces 90-day max like invoice:filter
  ipcMain.handle('expense:filter', withAppReady(async (_event, startDate: string, endDate: string) => {
    z.object({ startDate: z.string().min(1), endDate: z.string().min(1) }).parse({ startDate, endDate });

    const dateDifference = dayjs(endDate).diff(dayjs(startDate), 'days');
    if (dateDifference > MAX_DATE_RANGE) {
      throw new Error(
        `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
      );
    }

    const expenses = await getExpenses({
      where: {
        date: {
          [Op.between]: [
            `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        },
      },
      order: [['date', 'DESC']],
    });
    return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
  }));

  // Paginated search — replaces unbounded search
  ipcMain.handle('expense:search', withAppReady(async (_event, input: unknown = {}) => {
    const query = expenseListQuerySchema.parse(input);
    const { page, pageSize, search } = query;

    if (!search) {
      return toPaginatedResult([], 0, page, pageSize);
    }

    const { rows, count } = await Expense.findAndCountAll({
      ...toPaginationOptions({ page, pageSize }),
      where: {
        [Op.or]: [
          { type: { [Op.substring]: search } },
          { note: { [Op.substring]: search } },
        ],
      },
      order: [['date', 'DESC']],
    });

    return toPaginatedResult(
      rows.map((e: any) => (e.toJSON ? e.toJSON() : e)),
      count,
      page,
      pageSize
    );
  }));

  ipcMain.handle('expense:getTypes', withAppReady(async () => {
    const types = await ExpenseType.findAll();
    return (types as any[]).map((t: any) => (t.toJSON ? t.toJSON() : t));
  }));

  ipcMain.handle('expense:createType', withAppReady(async (_event, values: any) => {
    z.object({ type: z.string().min(1) }).parse(values);
    const expenseType = await (ExpenseType as any).create(values);
    return expenseType.toJSON ? expenseType.toJSON() : expenseType;
  }));
}
