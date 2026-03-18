"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const expenseType = require("./expenseType-BdnVKnYp.js");
const expense = require("./expense-e9NOTXMw.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
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
const expenseInputSchema = zod.z.object({
  type: zod.z.string().min(1),
  amount: zod.z.number().min(0),
  date: zod.z.date(),
  note: zod.z.string().optional().nullable()
});
function registerExpenseHandlers() {
  electron.ipcMain.handle("expense:getAll", async () => {
    const expenses = await getExpenses({});
    return expenses.map((e) => e.toJSON ? e.toJSON() : e);
  });
  electron.ipcMain.handle("expense:getById", async (_event, id) => {
    zod.z.number().parse(id);
    const expense2 = await getExpenseById(id);
    if (!expense2) {
      throw new Error("Expense not found");
    }
    return expense2.toJSON ? expense2.toJSON() : expense2;
  });
  electron.ipcMain.handle("expense:create", async (_event, values) => {
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
  });
  electron.ipcMain.handle("expense:update", async (_event, id, values) => {
    zod.z.number().parse(id);
    const parsedValues = expenseInputSchema.parse(values);
    await updateExpense(
      id,
      {
        ...parsedValues,
        note: parsedValues.note || void 0
      }
    );
  });
  electron.ipcMain.handle("expense:delete", async (_event, id) => {
    const schema = zod.z.object({ id: zod.z.number() });
    schema.parse({ id });
    await deleteExpense(id);
  });
  electron.ipcMain.handle(
    "expense:filter",
    async (_event, startDate, endDate) => {
      const schema = zod.z.object({
        startDate: zod.z.string().min(1),
        endDate: zod.z.string().min(1)
      });
      schema.parse({ startDate, endDate });
      const expenses = await getExpenses({
        where: {
          date: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        }
      });
      return expenses.map((e) => e.toJSON ? e.toJSON() : e);
    }
  );
  electron.ipcMain.handle("expense:search", async (_event, value) => {
    zod.z.string().min(1).parse(value);
    const expenses = await getExpenses({
      where: {
        [sequelize.Op.or]: [
          { type: { [sequelize.Op.substring]: value } },
          { note: { [sequelize.Op.substring]: value } }
        ]
      },
      order: [["date", "DESC"]]
    });
    return expenses.map((e) => e.toJSON ? e.toJSON() : e);
  });
  electron.ipcMain.handle("expense:getTypes", async () => {
    const types = await expenseType.default.findAll();
    return types.map((t) => t.toJSON ? t.toJSON() : t);
  });
  electron.ipcMain.handle("expense:createType", async (_event, values) => {
    const schema = zod.z.object({ type: zod.z.string().min(1) });
    schema.parse(values);
    const expenseType$1 = await expenseType.default.create(values);
    return expenseType$1.toJSON ? expenseType$1.toJSON() : expenseType$1;
  });
}
exports.registerExpenseHandlers = registerExpenseHandlers;
