"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const bcryptjs = require("bcryptjs");
const zod = require("zod");
const user = require("./user-DoEgQ7As.js");
const index = require("../index.js");
const listing = require("./listing-fG59YslC.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
const findOneUser = (args) => {
  return user.default.findOne({
    ...args
  }).then((data) => {
    return data;
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
const toRendererUser = (user2) => {
  const serializedUser = user2 && user2.toJSON ? user2.toJSON() : user2;
  if (!serializedUser || typeof serializedUser !== "object") {
    return null;
  }
  const { password, ...safeUser } = serializedUser;
  return safeUser;
};
const toUserSession = (user2) => {
  return index.sanitizeUserSession(toRendererUser(user2));
};
function registerUserHandlers() {
  electron.ipcMain.handle(
    "user:login",
    async (_event, credentials) => {
      await index.ensureAuthReady();
      const schema = zod.z.object({
        username: zod.z.string().min(3).max(255),
        password: zod.z.string().min(3).max(255)
      });
      schema.parse(credentials);
      const user2 = await findOneUser({
        where: { username: credentials.username }
      });
      if (!user2) {
        throw new Error("A user with this username could not be found");
      }
      const validPassword = await bcryptjs.compare(
        credentials.password,
        user2.password
      );
      if (!validPassword) throw new Error("Invalid password");
      const rendererUser = toUserSession(user2);
      if (!rendererUser) {
        throw new Error("Invalid user session");
      }
      return rendererUser;
    }
  );
  electron.ipcMain.handle(
    "user:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await user.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((user2) => toRendererUser(user2)).filter(
          (user2) => user2 !== null
        ),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "user:getById",
    index.withAppReady(async (_event, id) => {
      zod.z.number().parse(id);
      const user2 = await getUserById(id);
      return toRendererUser(user2);
    })
  );
  electron.ipcMain.handle(
    "user:create",
    index.withAppReady(async (_event, values) => {
      const schema = zod.z.object({
        fullName: zod.z.string().min(3).max(255),
        username: zod.z.string().min(3).max(255),
        password: zod.z.string().min(8).max(255),
        role: zod.z.string().min(3).max(255)
      });
      schema.parse(values);
      const hashedPassword = await bcryptjs.hash(values.password, 12);
      await createUser({
        fullName: values.fullName,
        username: values.username,
        password: hashedPassword,
        role: values.role
      });
    })
  );
  electron.ipcMain.handle(
    "user:update",
    index.withAppReady(async (_event, id, values) => {
      zod.z.number().parse(id);
      await updateUser(id, values);
    })
  );
  electron.ipcMain.handle(
    "user:delete",
    index.withAppReady(async (_event, id) => {
      zod.z.number().parse(id);
      await deleteUser(id);
    })
  );
}
exports.registerUserHandlers = registerUserHandlers;
