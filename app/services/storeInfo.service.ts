import StoreInfo, { IStoreInfo } from '../models/storeInfo';

export const createStoreInfo = (values: Partial<IStoreInfo>) => {
  return StoreInfo.create(values).then((data: IStoreInfo) => {
    return data;
  });
};

export const updateStoreInfo = (id: number, values: Partial<IStoreInfo>) => {
  return StoreInfo.update(values, {
    where: {
      id,
    },
  }).then((data: IStoreInfo) => {
    return data;
  });
};

export const getStoreInfoById = (id: number) => {
  return StoreInfo.findByPk(id).then((data: IStoreInfo) => {
    return data;
  });
};

export const deleteStoreInfo = (id: number) => {
  return StoreInfo.destroy({
    where: {
      id,
    },
  }).then((data: IStoreInfo) => {
    return data;
  });
};

export const getStoreInfos = () => {
  return StoreInfo.findAll().then((data: IStoreInfo[]) => {
    return data;
  });
};
