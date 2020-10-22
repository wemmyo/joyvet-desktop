import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';
import sequelize from './utils/database';
import Customer from './models/customer';
import Invoice from './models/invoice';
import Payment from './models/payment';
import Product from './models/product';
import Purchase from './models/purchase';
import Receipt from './models/receipt';
import Supplier from './models/supplier';
import User from './models/user';
import PriceLevel from './models/priceLevel';
import SaleType from './models/saleType';
import ProductGroup from './models/productGroup';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./views/Root').default;
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});

Customer.hasOne(PriceLevel);

Invoice.hasOne(Customer);
Invoice.hasMany(Product);
// Invoice.hasMany(PriceLevel);
Invoice.hasOne(SaleType);
Invoice.hasOne(User);

Product.hasMany(PriceLevel);
// Product.hasMany(Supplier);
Product.hasOne(ProductGroup);

Supplier.hasMany(Product);

Receipt.hasOne(Customer);
Receipt.hasOne(User);

Payment.hasOne(Supplier);
Payment.hasOne(User);

Purchase.hasOne(User);
Purchase.hasOne(Supplier);
Purchase.hasMany(Product);

sequelize
  .sync({ force: true })
  // .sync()
  .then((result: any) => {
    console.log(result);
  })
  .catch((error: any) => {
    console.log(error);
  });
