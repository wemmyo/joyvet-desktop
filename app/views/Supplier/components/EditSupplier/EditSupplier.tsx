import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSidebarContext } from '../../../../contexts/SidebarContext';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';
import {
  getSingleSupplierFn,
  deleteSupplierFn,
  getSuppliersFn,
  updateSupplierFn,
} from '../../../../controllers/supplier.controller';
import { ISupplier } from '../../../../models/supplier';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

export interface EditSupplierProps {
  supplierId: number;
}

const EditSupplier: React.FC<EditSupplierProps> = ({
  supplierId,
}: EditSupplierProps) => {
  const [supplier, setSupplier] = useState<ISupplier>({} as ISupplier);
  const [values, setValues] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    balance: '',
  });

  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleSupplierFn(supplierId);
      setSupplier(response);
      setValues({
        fullName: response.fullName || '',
        address: response.address || '',
        phoneNumber: response.phoneNumber || '',
        balance: String(response.balance || ''),
      });
    };
    fetchData();
  }, [supplierId]);

  const handleDeleteSupplier = async () => {
    await deleteSupplierFn(supplierId);
    closeSideContent();
    await getSuppliersFn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSupplierFn(values, supplierId);
    closeSideContent();
    await getSuppliersFn();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Full Name"
          type="text"
          value={values.fullName}
          onChange={(e) => setValues({ ...values, fullName: e.target.value })}
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
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Phone Number"
          type="tel"
          value={values.phoneNumber}
          onChange={(e) =>
            setValues({ ...values, phoneNumber: e.target.value })
          }
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          placeholder="Balance"
          type="number"
          value={values.balance}
          onChange={(e) => setValues({ ...values, balance: e.target.value })}
          disabled={!isAdmin()}
        />
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" variant="default">
          Update
        </Button>
        {isAdmin() ? (
          <Button
            onClick={handleDeleteSupplier}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to={`${routes.SUPPLIER}/${supplierId}`}>History</Link>
        </Button>
      </div>
    </form>
  );
};
export default EditSupplier;
