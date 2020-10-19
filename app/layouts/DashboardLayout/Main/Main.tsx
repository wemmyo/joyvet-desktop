import * as React from 'react';
import styles from './Main.css';
import { Input, Button, Icon } from 'semantic-ui-react';
import Product from '../../../models/product';
// import db from '../../../utils/database';

export interface MainSectionProps {}

const MainSection = () => {
  // db.execute('SELECT * FROM products').then((result: any) => {
  //   console.log(result);
  // });
  Product.findAll()
    .then((products: any) => {
      //product list
      console.log(products);
      products.map((each: any) => {
        console.log(each.title);
      });

      // res.render("shop/product-list", {
      //   prods: products,
      //   pageTitle: "All Products",
      //   path: "/products",
      // });
    })
    .catch((err: any) => {
      console.log(err);
    });

  return (
    <div className={styles.main}>
      <header className={styles.main__header}>
        <h2 className={styles.main__headerTitle}>Main Area</h2>
        <div className={styles.main__headerLeft}>
          <Button icon labelPosition="left">
            <Icon name="filter" />
            Filter
          </Button>
          <Button color="blue" icon labelPosition="left">
            <Icon inverted color="grey" name="add" />
            Create
          </Button>

          <Input icon="search" placeholder="Search..." />
        </div>
      </header>
    </div>
  );
};

export default MainSection;
