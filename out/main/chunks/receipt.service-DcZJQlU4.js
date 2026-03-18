"use strict";
const receipt = require("./receipt-CgVNnpBY.js");
const getReceipts = async (args) => {
  return receipt.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getReceiptById = (id) => {
  return receipt.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateReceipt = (id, receipt$1, transaction) => {
  return receipt.default.update(receipt$1, {
    where: {
      id
    },
    transaction
  }).then((data) => {
    return data;
  });
};
exports.getReceiptById = getReceiptById;
exports.getReceipts = getReceipts;
exports.updateReceipt = updateReceipt;
