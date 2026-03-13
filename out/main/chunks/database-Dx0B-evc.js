"use strict";
const fs = require("fs");
const path = require("path");
const electron = require("electron");
const Sequelize = require("sequelize");
const openDialog = () => {
  const result = electron.dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [{ name: "Database", extensions: ["db", "sqlite", "sql"] }]
  });
  if (result) return result[0];
  return void 0;
};
const checkForDB = () => {
  const userDataDir = electron.app.getPath("userData");
  const absolutePath = path.join(userDataDir, "pathToDB");
  if (fs.existsSync(absolutePath)) {
    return fs.readFileSync(absolutePath, "utf8");
  }
  const pathContent = electron.dialog.showSaveDialogSync({
    title: "Select folder for database",
    defaultPath: "joyvet.db",
    properties: ["createDirectory"]
  });
  if (!pathContent) {
    electron.app.quit();
    return "";
  }
  fs.writeFileSync(absolutePath, pathContent);
  return fs.readFileSync(absolutePath, "utf8");
};
const database = (() => {
  if (process.env.NODE_ENV === "development") {
    const testPath = openDialog();
    if (!testPath) {
      electron.app.quit();
      return null;
    }
    return new Sequelize({
      dialect: "sqlite",
      storage: testPath,
      dialectOptions: { connectTimeout: 3e3 },
      logging: false
    });
  }
  return new Sequelize({
    dialect: "sqlite",
    storage: checkForDB(),
    dialectOptions: { connectTimeout: 3e3 },
    logging: false
  });
})();
exports.database = database;
exports.openDialog = openDialog;
