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
exports.getReceipts = getReceipts;
