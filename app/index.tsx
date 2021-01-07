import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import bycrpt from 'bcryptjs';
// import fs from 'fs';
// import { remote } from 'electron';

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
// import PriceLevel from './models/priceLevel';
// import ProductGroup from './models/productGroup';
import InvoiceItem from './models/invoiceItem';
import PurchaseItem from './models/purchaseItem';
import User from './models/user';

/*
  Check if .txt file with db path exists
  if !exist, open dialog, select file path
  Save file path to .txt
  Run sequelize with saved file path
*/

// const appDB = () => {
//   fs.readFile('message.txt', (err, data) => {
//     const body = [];
//     if (body.length < 1) {
//       return null;
//     }
//     body.push(data);
//     const parsedBody = Buffer.concat(body).toString();
//     return parsedBody;
//   });
// };

// if (!appDB) {
//   remote.dialog
//     .showOpenDialog({
//       properties: ['openFile', 'openDirectory'],
//     })
//     .then((result) => {
//       console.log(result.canceled);
//       console.log(result.filePaths);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }

// remote.dialog.showSaveDialogSync({
//   title: 'Select folder',
//   defaultPath: 'joyvet.db',
// });

// fs.writeFileSync('message.txt', 'DUMMY');

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
