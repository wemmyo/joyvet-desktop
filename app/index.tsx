import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import bycrpt from 'bcryptjs';

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
import InvoiceItem from './models/invoiceItem';
import PurchaseItem from './models/purchaseItem';
import User from './models/user';

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

Invoice.belongsToMany(Product, { through: InvoiceItem });
Product.belongsToMany(Invoice, { through: InvoiceItem });

Customer.hasMany(Invoice);
Invoice.belongsTo(Customer);

Receipt.belongsTo(Customer);
Customer.hasMany(Receipt);

Payment.belongsTo(Supplier);
Supplier.hasMany(Payment);

Purchase.belongsTo(Supplier);
Supplier.hasMany(Purchase);
Purchase.belongsToMany(Product, { through: PurchaseItem });
Product.belongsToMany(Purchase, { through: PurchaseItem });

// Assign every action to a user/staff
Invoice.belongsTo(User, {
  foreignKey: 'postedBy',
});
Payment.belongsTo(User, {
  foreignKey: 'postedBy',
});
Receipt.belongsTo(User, {
  foreignKey: 'postedBy',
});
Purchase.belongsTo(User, {
  foreignKey: 'postedBy',
});
Product.belongsTo(User, {
  foreignKey: 'postedBy',
});
Supplier.belongsTo(User, {
  foreignKey: 'postedBy',
});
Customer.belongsTo(User, {
  foreignKey: 'postedBy',
});

const sequelizeSync = async () => {
  try {
    await sequelize.sync();
    const hashedPassword = await bycrpt.hash('admin', 12);
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      await User.create({
        fullName: 'admin',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
    }
  } catch (err) {
    console.log(err);
  }
};

sequelizeSync();
