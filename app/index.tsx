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
// import User from './models/user';
import PriceLevel from './models/priceLevel';
import ProductGroup from './models/productGroup';
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

// Invoice.hasMany(Product);
// Product.belongsTo(Invoice);
Invoice.belongsToMany(Product, { through: InvoiceItem });
Product.belongsToMany(Invoice, { through: InvoiceItem });

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
Purchase.belongsToMany(Product, { through: PurchaseItem });
Product.belongsToMany(Purchase, { through: PurchaseItem });

User.hasMany(Invoice);
Invoice.belongsTo(User);

User.hasMany(Payment, {
  foreignKey: 'postedBy',
});
User.hasMany(Receipt, {
  foreignKey: 'postedBy',
});
User.hasMany(Purchase, {
  foreignKey: 'postedBy',
});
User.hasMany(Product, {
  foreignKey: 'postedBy',
});
User.hasMany(Supplier, {
  foreignKey: 'postedBy',
});
User.hasMany(Customer, {
  foreignKey: 'postedBy',
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(async () => {
    try {
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
  });
