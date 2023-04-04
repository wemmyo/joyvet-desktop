import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';

import TextInput from '../../../../components/TextInput/TextInput';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import {
  getPaymentsFn,
  getSinglePaymentFn,
  updatePaymentFn,
} from '../../../../controllers/payment.controller';
import { getSuppliersFn } from '../../../../controllers/supplier.controller';
import { IPayment } from '../../../../models/payment';
import { ISupplier } from '../../../../models/supplier';

export interface EditPaymentProps {
  paymentId: string | number;
}

const EditPayment: React.FC<EditPaymentProps> = ({
  paymentId,
}: EditPaymentProps) => {
  const [payment, setPayment] = useState<IPayment>({} as IPayment);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const [paymentResponse, suppliersResponse] = await Promise.all([
        getSinglePaymentFn(Number(paymentId)),
        getSuppliersFn(),
      ]);
      setPayment(paymentResponse);
      setSuppliers(suppliersResponse);
    };
    fetchData();
  }, [paymentId]);

  const renderSuppliers = () => {
    const supplierList = suppliers.map((eachSupplier: any) => {
      return (
        <option key={eachSupplier.id} value={eachSupplier.id}>
          {eachSupplier.fullName}
        </option>
      );
    });
    return supplierList;
  };

  const { supplierId, amount, note } = payment;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        supplierId: supplierId || '',
        amount: amount || '',
        note: note || '',
      }}
      // validationSchema={EditPaymentSchema}
      onSubmit={(values) => {
        dispatch(
          updatePaymentFn(values, paymentId, () => {
            dispatch(closeSideContentFn());
            dispatch(getPaymentsFn());
          })
        );
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <div className="field">
            <label htmlFor="supplierId">Supplier</label>
            <Field
              id="supplierId"
              name="supplierId"
              component="select"
              className="ui dropdown"
            >
              <option value="" disabled hidden>
                Select Supplier
              </option>
              {renderSuppliers()}
            </Field>
          </div>

          <Field
            name="note"
            placeholder="Note"
            label="Note"
            type="text"
            component={TextInput}
          />

          <Button onClick={() => handleSubmit()} type="Submit" fluid primary>
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditPayment;
