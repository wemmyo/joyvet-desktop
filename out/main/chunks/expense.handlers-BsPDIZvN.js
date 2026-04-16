"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const expense = require("./expense-e9NOTXMw.js");
const expenseType = require("./expenseType-BdnVKnYp.js");
const listing = require("./listing-iK2d8TQt.js");
const index = require("../index.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const getExpenses = (args) => {
  return expense.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getExpenseById = (id) => {
  return expense.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateExpense = (id, expense$1, transaction) => {
  return expense.default.update(expense$1, {
    where: {
      id
    },
    transaction
  }).then((data) => {
    return data;
  });
};
const deleteExpense = (id) => {
  return expense.default.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const createExpense = (expense$1) => {
  return expense.default.create(expense$1).then((data) => {
    return data;
  });
};
const MAX_DATE_RANGE = 90;
function registerExpenseHandlers() {
  electron.ipcMain.handle(
    "expense:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.expenseListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await expense.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        order: [["date", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((e) => e.toJSON ? e.toJSON() : e),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "expense:getById",
    index.withAppReady(async (_event, id) => {
      zod.z.number().parse(id);
      const expense2 = await getExpenseById(id);
      if (!expense2) throw new Error("Expense not found");
      return expense2.toJSON ? expense2.toJSON() : expense2;
    })
  );
  electron.ipcMain.handle(
    "expense:create",
    index.withAppReady(async (_event, values) => {
      const parsedValues = zod.z.object({
        type: zod.z.string().min(1),
        amount: zod.z.coerce.number(),
        date: zod.z.string().min(1),
        note: zod.z.string().optional().nullable()
      }).parse(values);
      const expense2 = await createExpense({
        ...parsedValues,
        date: new Date(parsedValues.date),
        note: parsedValues.note || void 0,
        postedBy: values.postedBy || null
      });
      return expense2.toJSON ? expense2.toJSON() : expense2;
    })
  );
  electron.ipcMain.handle(
    "expense:update",
    index.withAppReady(async (_event, id, values) => {
      zod.z.number().parse(id);
      const parsedValues = zod.z.object({
        type: zod.z.string().min(1),
        amount: zod.z.coerce.number(),
        date: zod.z.string().min(1),
        note: zod.z.string().optional().nullable()
      }).parse(values);
      await updateExpense(id, {
        ...parsedValues,
        date: new Date(parsedValues.date),
        note: parsedValues.note || void 0
      });
    })
  );
  electron.ipcMain.handle(
    "expense:delete",
    index.withAppReady(async (_event, id) => {
      zod.z.object({ id: zod.z.number() }).parse({ id });
      await deleteExpense(id);
    })
  );
  electron.ipcMain.handle(
    "expense:filter",
    index.withAppReady(async (_event, startDate, endDate) => {
      zod.z.object({
        startDate: zod.z.string().min(1),
        endDate: zod.z.string().min(1)
      }).parse({ startDate, endDate });
      const dateDifference = dayjs(endDate).diff(dayjs(startDate), "days");
      if (dateDifference > MAX_DATE_RANGE) {
        throw new Error(
          `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
        );
      }
      const expenses = await getExpenses({
        where: {
          date: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
            ]
          }
        },
        order: [["date", "DESC"]]
      });
      return expenses.map((e) => e.toJSON ? e.toJSON() : e);
    })
  );
  electron.ipcMain.handle(
    "expense:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.expenseListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      if (!search) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await expense.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        where: {
          [sequelize.Op.or]: [
            { type: { [sequelize.Op.substring]: search } },
            { note: { [sequelize.Op.substring]: search } }
          ]
        },
        order: [["date", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((e) => e.toJSON ? e.toJSON() : e),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "expense:getTypes",
    index.withAppReady(async () => {
      const types = await expenseType.default.findAll();
      return types.map((t) => t.toJSON ? t.toJSON() : t);
    })
  );
  electron.ipcMain.handle(
    "expense:createType",
    index.withAppReady(async (_event, values) => {
      zod.z.object({ type: zod.z.string().min(1) }).parse(values);
      const expenseType$1 = await expenseType.default.create(values);
      return expenseType$1.toJSON ? expenseType$1.toJSON() : expenseType$1;
    })
  );
}
exports.registerExpenseHandlers = registerExpenseHandlers;
