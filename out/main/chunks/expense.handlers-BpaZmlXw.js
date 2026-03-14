"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
const Sequelize$1 = require("sequelize");
const ExpenseType = database.database.define("expenseType", {
  id: {
    type: Sequelize$1.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  type: Sequelize$1.STRING
});
const Sequelize = require("sequelize");
const Expense = database.database.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date: Sequelize.DATE,
  amount: Sequelize.INTEGER,
  type: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING
});
const getExpenses = (args) => {
  return Expense.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const deleteExpense = (id) => {
  return Expense.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const createExpense = (expense) => {
  return Expense.create(expense).then((data) => {
    return data;
  });
};
function registerExpenseHandlers() {
  electron.ipcMain.handle("expense:getAll", async () => {
    const expenses = await getExpenses({});
    return expenses.map((e) => e.toJSON ? e.toJSON() : e);
  });
  electron.ipcMain.handle("expense:create", async (_event, values) => {
    const schema = zod.z.object({
      type: zod.z.string().min(1),
      amount: zod.z.number(),
      date: zod.z.string().min(1),
      note: zod.z.string()
    });
    schema.parse(values);
    const expense = await createExpense(values);
    return expense.toJSON ? expense.toJSON() : expense;
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
  electron.ipcMain.handle("expense:getTypes", async () => {
    const types = await ExpenseType.findAll();
    return types.map((t) => t.toJSON ? t.toJSON() : t);
  });
  electron.ipcMain.handle("expense:createType", async (_event, values) => {
    const schema = zod.z.object({ type: zod.z.string().min(1) });
    schema.parse(values);
    const expenseType = await ExpenseType.create(values);
    return expenseType.toJSON ? expenseType.toJSON() : expenseType;
  });
}
exports.registerExpenseHandlers = registerExpenseHandlers;
