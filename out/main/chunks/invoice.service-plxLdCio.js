"use strict";
const invoice = require("./invoice-Civ-gfB_.js");
const getInvoices = async (args) => {
  return invoice.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getInvoiceById = (id, args) => {
  return invoice.default.findByPk(id, {
    ...args
  }).then((data) => {
    return data;
  });
};
exports.getInvoiceById = getInvoiceById;
exports.getInvoices = getInvoices;
