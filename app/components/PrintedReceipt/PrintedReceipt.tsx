import * as React from 'react';
import { Table } from 'semantic-ui-react';
import styles from './PrintedReceipt.css';

export interface PrintedReceiptProps {}

export interface PrintedReceiptState {}

class PrintedReceipt extends React.Component<
  PrintedReceiptProps,
  PrintedReceiptState
> {
  // state = { :  }
  render() {
    return (
      <div className={styles.receipt}>
        <div className={styles.receipt__companyInfo}>
          <h5>JOY VETERINARY</h5>
          <p>
            37, Iganmode Road, Sango Ota,
            <br /> Ogun State
          </p>
          <p>
            <b>Sales Invoice!</b>
          </p>
          <hr />
        </div>
        <p>Customer: VALUED CUSTOMER</p>
        <p>Invoice#: 7284746</p>
        <p>Transaction Date: 23-10-2020</p>
        <Table basic celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Qty</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>ALLER AQUA 4.8mm</Table.Cell>
              <Table.Cell>2.0</Table.Cell>
              <Table.Cell>650.00</Table.Cell>
              <Table.Cell>1,300.00</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>ALLER AQUA 4.8mm</Table.Cell>
              <Table.Cell>2.0</Table.Cell>
              <Table.Cell>650.00</Table.Cell>
              <Table.Cell>1,300.00</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Total</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell>1,300.00</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>Cashier: IYANU</p>
        <p>
          <b>
            Please, Ensure you check all item(s) given to you with your invoice
            before leaving the counter.
          </b>
        </p>
      </div>
    );
  }
}

export default PrintedReceipt;
