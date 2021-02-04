import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleProductFn,
  selectProductState,
  updateProductFn,
  getProductsFn,
} from '../../../../slices/productSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditProductProps {
  productId: string | number;
}

const EditProduct: React.FC<EditProductProps> = ({
  productId,
}: EditProductProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleProductFn(productId));
  };

  useEffect(fetchData, [productId]);

  const productState = useSelector(selectProductState);

  const { data: productRaw } = productState.singleProduct;

  const product = productRaw ? JSON.parse(productRaw) : {};
  // console.log(product);

  const { title, stock, sellPrice, sellPrice2, sellPrice3, buyPrice } = product;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        title: title || '',
        stock: stock || '',
        sellPrice: sellPrice || '',
        sellPrice2: sellPrice2 || '',
        sellPrice3: sellPrice3 || '',
        buyPrice: buyPrice || '',
      }}
      // validationSchema={EditProductSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateProductFn(values, productId, () => {
            dispatch(closeSideContentFn());
            dispatch(getProductsFn());
          })
        );
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="title"
            placeholder="Title"
            label="Title"
            type="text"
            component={TextInput}
          />
          <Field
            name="stock"
            placeholder="Number In Stock"
            label="Number In Stock"
            type="number"
            component={TextInput}
          />
          <Field
            name="buyPrice"
            placeholder="Buy Price"
            label="Buy Price"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice"
            placeholder="Sell Price"
            label="Sell Price"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice2"
            placeholder="Sell Price 2"
            label="Sell Price 2"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice3"
            placeholder="Sell Price 3"
            label="Sell Price 3"
            type="number"
            component={TextInput}
          />

          <Button onClick={() => handleSubmit()} type="Submit" fluid positive>
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditProduct;

// const EditProductSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
