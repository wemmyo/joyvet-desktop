"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const bcrypt = require("bcryptjs");
const zod = require("zod");
const user = require("./user-DoEgQ7As.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
const findOneUser = (args) => {
  return user.default.findOne({
    ...args
  }).then((data) => {
    return data;
  });
};
const getUsers = (args) => {
  return user.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getUserById = (id) => {
  return user.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateUser = (id, user$1) => {
  return user.default.update(user$1, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const deleteUser = (id) => {
  return user.default.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const createUser = (user$1) => {
  return user.default.create(user$1).then((data) => {
    return data;
  });
};
function registerUserHandlers() {
  electron.ipcMain.handle(
    "user:login",
    async (_event, credentials) => {
      const schema = zod.z.object({
        username: zod.z.string().min(3).max(255),
        password: zod.z.string().min(3).max(255)
      });
      schema.parse(credentials);
      const user2 = await findOneUser({
        where: { username: credentials.username }
      });
      if (!user2)
        throw new Error("A user with this username could not be found");
      const validPassword = await bcrypt.compare(
        credentials.password,
        user2.password
      );
      if (!validPassword) throw new Error("Invalid password");
      return user2.toJSON ? user2.toJSON() : user2;
    }
  );
  electron.ipcMain.handle("user:getAll", async () => {
    const users = await getUsers({});
    return users.map((u) => u.toJSON ? u.toJSON() : u);
  });
  electron.ipcMain.handle("user:getById", async (_event, id) => {
    const user2 = await getUserById(id);
    return user2.toJSON ? user2.toJSON() : user2;
  });
  electron.ipcMain.handle("user:create", async (_event, values) => {
    const schema = zod.z.object({
      fullName: zod.z.string().min(3).max(255),
      username: zod.z.string().min(3).max(255),
      password: zod.z.string().min(3).max(255),
      role: zod.z.string().min(3).max(255)
    });
    schema.parse(values);
    const hashedPassword = await bcrypt.hash(values.password, 12);
    await createUser({
      fullName: values.fullName,
      username: values.username,
      password: hashedPassword,
      role: values.role
    });
  });
  electron.ipcMain.handle("user:update", async (_event, id, values) => {
    await updateUser(id, values);
  });
  electron.ipcMain.handle("user:delete", async (_event, id) => {
    const user2 = await deleteUser(id);
    if (user2) await user2.destroy();
  });
}
exports.registerUserHandlers = registerUserHandlers;
