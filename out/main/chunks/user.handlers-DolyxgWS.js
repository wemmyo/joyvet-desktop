"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const bcryptjs = require("bcryptjs");
const zod = require("zod");
const user = require("./user-BvhgydGB.js");
const database = require("./database-Dx0B-evc.js");
const index = require("../index.js");
const listing = require("./listing-iK2d8TQt.js");
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
const createUser = (user$1) => {
  return user.default.create(user$1).then((data) => {
    return data;
  });
};
let activeSession = null;
const setActiveSession = (session) => {
  activeSession = session;
};
const requireRole = (roles) => {
  if (!activeSession) {
    throw new Error("Not authenticated");
  }
  if (!roles.includes(activeSession.role)) {
    throw new Error("You do not have permission to perform this action");
  }
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
      setActiveSession({
        id: rendererUser.id,
        role: rendererUser.role,
        fullName: rendererUser.fullName
      });
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
      requireRole(["admin", "manager"]);
      const schema = zod.z.object({
        fullName: zod.z.string().min(3).max(255),
        username: zod.z.string().min(3).max(255),
        password: zod.z.string().min(8).max(255),
        role: zod.z.enum(["admin", "manager", "staff", "newbie"])
      });
      schema.parse(values);
      const hashedPassword = await bcryptjs.hash(values.password, 12);
      try {
        await createUser({
          fullName: values.fullName,
          username: values.username,
          password: hashedPassword,
          role: values.role
        });
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          throw new Error(
            `A user with the username "${values.username}" already exists`
          );
        }
        throw error;
      }
    })
  );
  electron.ipcMain.handle(
    "user:update",
    index.withAppReady(async (_event, id, values) => {
      requireRole(["admin", "manager"]);
      zod.z.number().parse(id);
      const updateSchema = zod.z.object({
        fullName: zod.z.string().min(3).max(255).optional(),
        username: zod.z.string().min(3).max(255).optional(),
        role: zod.z.enum(["admin", "manager", "staff", "newbie"]).optional(),
        password: zod.z.string().min(8).max(255).optional()
      });
      const parsed = updateSchema.parse(values);
      if (parsed.password) {
        parsed.password = await bcryptjs.hash(parsed.password, 12);
      }
      await updateUser(id, parsed);
    })
  );
  electron.ipcMain.handle(
    "user:delete",
    index.withAppReady(async (_event, id) => {
      requireRole(["admin"]);
      zod.z.number().parse(id);
      await database.database.transaction(async (t) => {
        const user$1 = await user.default.findByPk(id, { transaction: t });
        if (user$1 && user$1.role === "admin") {
          const adminCount = await user.default.count({
            where: { role: "admin" },
            transaction: t
          });
          if (adminCount <= 1) {
            throw new Error("Cannot delete the last admin account");
          }
        }
        await user.default.destroy({ where: { id }, transaction: t });
      });
    })
  );
  electron.ipcMain.handle(
    "user:logout",
    index.withAppReady(async () => {
      setActiveSession(null);
    })
  );
}
exports.registerUserHandlers = registerUserHandlers;
