import React, { useEffect, useState } from 'react';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import { IStoreInfo } from '../../../../models/storeInfo';
import {
  deleteStoreInfoFn,
  getSingleStoreInfoFn,
  getStoreInfoFn,
  updateStoreInfoFn,
} from '../../../../controllers/storeInfo.controller';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

export interface EditStoreInfoProps {
  storeInfoId: string | number;
}

const EditStoreInfo: React.FC<EditStoreInfoProps> = ({
  storeInfoId,
}: EditStoreInfoProps) => {
  const [storeInfo, setStoreInfo] = useState<IStoreInfo>({} as IStoreInfo);
  const [values, setValues] = useState({
    storeName: '',
    address: '',
    phoneNumber: '',
  });
  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleStoreInfoFn(Number(storeInfoId));
      setStoreInfo(response);
      setValues({
        storeName: response.storeName || '',
        address: response.address || '',
        phoneNumber: response.phoneNumber || '',
      });
    };
    fetchData();
  }, [storeInfoId]);

  const deleteStoreInfo = async () => {
    await deleteStoreInfoFn(Number(storeInfoId));
    await getStoreInfoFn();
    closeSideContent();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreInfoFn(values, Number(storeInfoId));
    closeSideContent();
    await getStoreInfoFn();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="storeName">Store name</Label>
        <Input
          id="storeName"
          placeholder="Store name"
          type="text"
          value={values.storeName}
          onChange={(e) => setValues({ ...values, storeName: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Address"
          type="text"
          value={values.address}
          onChange={(e) => setValues({ ...values, address: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          placeholder="Phone number"
          type="text"
          value={values.phoneNumber}
          onChange={(e) =>
            setValues({ ...values, phoneNumber: e.target.value })
          }
        />
      </div>
      <Button type="submit" className="w-full">
        Update
      </Button>
      <Button
        className="w-full mt-2"
        onClick={deleteStoreInfo}
        type="button"
        variant="destructive"
      >
        Delete
      </Button>
    </form>
  );
};
export default EditStoreInfo;
