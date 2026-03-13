"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const zod = require("zod");
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
const Sequelize = require("sequelize");
const StoreInfo = database.database.define(
  "storeInfo",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    storeName: Sequelize.STRING,
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING
  },
  {
    timestamps: false
  }
);
const createStoreInfo = (values) => {
  return StoreInfo.create(values).then((data) => {
    return data;
  });
};
const updateStoreInfo = (id, values) => {
  return StoreInfo.update(values, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const getStoreInfos = () => {
  return StoreInfo.findAll().then((data) => {
    return data;
  });
};
function registerStoreInfoHandlers() {
  electron.ipcMain.handle("storeInfo:get", async () => {
    const storeInfos = await getStoreInfos();
    return storeInfos.map((s) => s.toJSON ? s.toJSON() : s);
  });
  electron.ipcMain.handle("storeInfo:create", async (_event, values) => {
    const schema = zod.z.object({
      storeName: zod.z.string().min(3).max(255),
      address: zod.z.string().min(3).max(255),
      phoneNumber: zod.z.string().min(3).max(255)
    });
    schema.parse(values);
    const storeInfo = await createStoreInfo(values);
    return storeInfo.toJSON ? storeInfo.toJSON() : storeInfo;
  });
  electron.ipcMain.handle("storeInfo:update", async (_event, values) => {
    const schema = zod.z.object({
      id: zod.z.number(),
      storeName: zod.z.string().min(3).max(255),
      address: zod.z.string().min(3).max(255),
      phoneNumber: zod.z.string().min(3).max(255)
    });
    schema.parse(values);
    const { id, ...rest } = values;
    await updateStoreInfo(id, rest);
  });
}
exports.registerStoreInfoHandlers = registerStoreInfoHandlers;
