import StoreInfo, { IStoreInfo } from '../models/storeInfo';

export const createStore = (values: Partial<IStoreInfo>) => {
  return StoreInfo.create(values).then((data: IStoreInfo) => {
    return data;
  });
};

export const updateStore = (id: number, values: Partial<IStoreInfo>) => {
  return StoreInfo.update(values, {
    where: {
      id,
    },
  }).then((data: IStoreInfo) => {
    return data;
  });
};
