"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const zod = require("zod");
const storeInfo = require("./storeInfo-Bg_7gZyj.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
const createStoreInfo = (values) => {
  return storeInfo.default.create(values).then((data) => {
    return data;
  });
};
const updateStoreInfo = (id, values) => {
  return storeInfo.default.update(values, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const getStoreInfoById = (id) => {
  return storeInfo.default.findByPk(id).then((data) => {
    return data;
  });
};
const deleteStoreInfo = (id) => {
  return storeInfo.default.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const getStoreInfos = () => {
  return storeInfo.default.findAll().then((data) => {
    return data;
  });
};
const storeInfoInputSchema = zod.z.object({
  storeName: zod.z.string().min(3).max(255),
  address: zod.z.string().min(3).max(255),
  phoneNumber: zod.z.string().min(3).max(255)
});
function registerStoreInfoHandlers() {
  electron.ipcMain.handle("storeInfo:getAll", async () => {
    const storeInfos = await getStoreInfos();
    return storeInfos.map((s) => s.toJSON ? s.toJSON() : s);
  });
  electron.ipcMain.handle("storeInfo:getById", async (_event, id) => {
    zod.z.number().parse(id);
    const storeInfo2 = await getStoreInfoById(id);
    if (!storeInfo2) {
      throw new Error("Store info not found");
    }
    return storeInfo2.toJSON ? storeInfo2.toJSON() : storeInfo2;
  });
  electron.ipcMain.handle("storeInfo:create", async (_event, values) => {
    const parsedValues = storeInfoInputSchema.parse(values);
    const storeInfo2 = await createStoreInfo(parsedValues);
    return storeInfo2.toJSON ? storeInfo2.toJSON() : storeInfo2;
  });
  electron.ipcMain.handle("storeInfo:update", async (_event, id, values) => {
    zod.z.number().parse(id);
    const parsedValues = storeInfoInputSchema.parse(values);
    await updateStoreInfo(id, parsedValues);
  });
  electron.ipcMain.handle("storeInfo:delete", async (_event, id) => {
    zod.z.number().parse(id);
    await deleteStoreInfo(id);
  });
}
exports.registerStoreInfoHandlers = registerStoreInfoHandlers;
