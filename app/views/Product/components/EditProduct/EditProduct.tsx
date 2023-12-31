import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import TextInput from '../../../../components/TextInput/TextInput';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';
import {
  getSingleProductFn,
  updateProductFn,
  deleteProductFn,
} from '../../../../controllers/product.controller';
import { IProduct } from '../../../../models/product';

export interface EditProductProps {
  productId: string | number;
  refreshProducts: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  productId,
  refreshProducts,
}: EditProductProps) => {
  const [product, setProduct] = useState<IProduct>({} as IProduct);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleProductFn(Number(productId));
      setProduct(response);
    };
    fetchData();
  }, [productId]);

  const { title, stock, sellPrice, sellPrice2, sellPrice3, buyPrice } = product;

  const onDeleteProduct = async () => {
    await deleteProductFn(Number(productId));
    dispatch(closeSideContentFn());
    refreshProducts();
  };

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
      onSubmit={async (values) => {
        await updateProductFn(values, productId);
        dispatch(closeSideContentFn());
        refreshProducts();
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
            disabled={!isAdmin()}
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
          <Button
            style={{ marginTop: '1rem' }}
            fluid
            as={Link}
            to={`${routes.PRODUCT}/${productId}`}
          >
            History
          </Button>
          <Button
            negative
            style={{ marginTop: '1rem' }}
            fluid
            onClick={onDeleteProduct}
          >
            Delete
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditProduct;
