import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSinglePaymentFn,
  selectPaymentState,
  updatePaymentFn,
  getPaymentsFn,
} from '../../../../slices/paymentSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import {
  getSuppliersFn,
  selectSupplierState,
} from '../../../../slices/supplierSlice';

export interface EditPaymentProps {
  paymentId: string | number;
}

const EditPayment: React.FC<EditPaymentProps> = ({
  paymentId,
}: EditPaymentProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSinglePaymentFn(paymentId));
    dispatch(getSuppliersFn());
  };

  useEffect(fetchData, [paymentId]);

  const paymentState = useSelector(selectPaymentState);
  const supplierState = useSelector(selectSupplierState);

  const { data: paymentRaw } = paymentState.singlePayment;
  const { data: suppliersRaw } = supplierState.suppliers;

  const payment = paymentRaw ? JSON.parse(paymentRaw) : {};
  const suppliers = suppliersRaw ? JSON.parse(suppliersRaw) : [];

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

// const EditPaymentSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
