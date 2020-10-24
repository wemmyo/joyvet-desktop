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
// import User from './models/user';
import PriceLevel from './models/priceLevel';
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

// Invoice.hasMany(Product);
// Product.belongsTo(Invoice);
Invoice.belongsToMany(Product, { through: 'ProductInvoice' });
Product.belongsToMany(Invoice, { through: 'ProductInvoice' });

Customer.hasMany(Invoice);
Invoice.belongsTo(Customer);

Customer.belongsTo(PriceLevel);
PriceLevel.hasOne(Customer);

Product.belongsTo(ProductGroup);
ProductGroup.hasOne(Product);

Receipt.belongsTo(Customer);
Customer.hasMany(Receipt);

Payment.belongsTo(Supplier);
Supplier.hasMany(Payment);

Purchase.belongsTo(Supplier);
Supplier.hasMany(Purchase);
Purchase.belongsToMany(Product, { through: 'ProductPurchase' });
Product.belongsToMany(Purchase, { through: 'ProductPurchase' });

sequelize
  // .sync({ force: true })
  .sync()
  .then((result: any) => {
    console.log(result);
  })
  .catch((error: any) => {
    console.log(error);
  });
