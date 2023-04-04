import Expense, { IExpense } from '../models/expense';

export const getExpenses = (args) => {
  return Expense.findAll({
    ...args,
  }).then((data: IExpense[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getExpenseById = (id: number) => {
  return Expense.findByPk(id, {}).then((data: IExpense) => {
    return data;
  });
};

export const updateExpense = (id: number, expense: Partial<IExpense>) => {
  return Expense.update(expense, {
    where: {
      id,
    },
  }).then((data: IExpense) => {
    return data;
  });
};

export const deleteExpense = (id: number) => {
  return Expense.destroy({
    where: {
      id,
    },
  }).then((data: IExpense) => {
    return data;
  });
};

export const createExpense = (expense: Partial<IExpense>) => {
  return Expense.create(expense).then((data: IExpense) => {
    return data;
  });
};
