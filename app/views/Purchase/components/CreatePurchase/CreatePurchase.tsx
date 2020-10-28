import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
// import * as Yup from 'yup';
import {
  getSuppliersFn,
  selectSupplierState,
} from '../../../../slices/supplierSlice';
import {
  getProductsFn,
  selectProductState,
} from '../../../../slices/productSlice';
import {
  createPurchaseFn,
  getPurchasesFn,
} from '../../../../slices/purchaseSlice';
import { useSelector, useDispatch } from 'react-redux';

export interface CreatePurchaseProps {}

const CreatePurchase: React.FC<CreatePurchaseProps> = () => {
  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);
  const { data: suppliers } = supplierState.suppliers;
  const productState = useSelector(selectProductState);
  const { data: products } = productState.products;

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };

  const fetchProducts = () => {
    dispatch(getProductsFn());
  };

  const fetchPurchases = () => {
    dispatch(getPurchasesFn());
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const handleNewPurchase = (values: any) => {
    dispatch(
      createPurchaseFn(values, () => {
        fetchPurchases();
      })
    );
  };

  const renderSuppliers = () => {
    const supplierList = suppliers.map((supplier: any) => {
      return (
        <option key={supplier.id} value={supplier.id}>
          {supplier.fullName}
        </option>
      );
    });
    return supplierList;
  };

  const renderProducts = () => {
    const supplierList = products.map((product: any) => {
      return (
        <option key={product.id} value={product.id}>
          {product.title}
        </option>
      );
    });
    return supplierList;
  };

  return (
    <Formik
      initialValues={{
        supplierId: '',
        productId: '',
        amount: '',
        note: '',
      }}
      // validationSchema={CreatePurchaseSchema}
      onSubmit={(values, actions) => {
        handleNewPurchase(values);
        actions.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <div className="field">
            <label>Supplier</label>
            <Field name="supplierId" component="select" className="ui dropdown">
              <option value="" disabled hidden>
                Select Supplier
              </option>
              {renderSuppliers()}
            </Field>
          </div>
          <div className="field">
            <label>Product</label>
            <Field name="productId" component="select" className="ui dropdown">
              <option value="" disabled hidden>
                Select Product
              </option>
              {renderProducts()}
            </Field>
          </div>

          <Field
            name="amount"
            placeholder="Amount Paid"
            label="Amount Paid"
            type="text"
            component={TextInput}
          />
          <Field
            name="note"
            placeholder="Note"
            label="Note"
            type="text"
            component={TextInput}
          />
          <Button onClick={() => handleSubmit()} type="Submit" fluid primary>
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreatePurchase;

const TextInput = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}: {
  [x: string]: any;
  field: any;
  form: any;
}) => {
  return (
    <Form.Input
      error={
        touched[field.name] && errors[field.name] ? errors[field.name] : false
      }
      label={props.label}
    >
      <input placeholder={props.placeholder} {...field} {...props} />
    </Form.Input>
  );
};
