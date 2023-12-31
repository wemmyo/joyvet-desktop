import User, { IUser } from '../models/user';

export const findOneUser = (args) => {
  return User.findOne({
    ...args,
  }).then((data: IUser) => {
    return data;
  });
};

export const getUsers = (args) => {
  return User.findAll({
    ...args,
  }).then((data: IUser[]) => {
    return data.map((item) => {
      return item;
    });
  });
};

export const getUserById = (id: number) => {
  return User.findByPk(id, {}).then((data: IUser) => {
    return data;
  });
};

export const updateUser = (id: number, user: Partial<IUser>) => {
  return User.update(user, {
    where: {
      id,
    },
  }).then((data: IUser) => {
    return data;
  });
};

export const deleteUser = (id: number) => {
  return User.destroy({
    where: {
      id,
    },
  }).then((data: IUser) => {
    return data;
  });
};

export const createUser = (user: Partial<IUser>) => {
  return User.create(user).then((data: IUser) => {
    return data;
  });
};
