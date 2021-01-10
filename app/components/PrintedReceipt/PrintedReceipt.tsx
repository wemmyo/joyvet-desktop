import * as React from 'react';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';

import styles from './PrintedReceipt.css';
import { getSingleInvoiceFn } from '../../slices/invoiceSlice';
import { numberWithCommas } from '../../utils/helpers';

export interface PrintedReceiptProps {
  // invoiceId:string|number;
  invoice: any;
  getSingleInvoiceFn: (id: string | number) => void;
}

class PrintedReceipt extends React.Component<PrintedReceiptProps> {
  renderItems = () => {
    const { data: invoiceRaw } = this.props.invoice;
    const invoice = invoiceRaw ? JSON.parse(invoiceRaw) : {};

    if (invoiceRaw) {
      const items = invoice.products.map((item: any) => {
        return (
          <Table.Row key={item.id}>
            <Table.Cell>{item.title}</Table.Cell>
            <Table.Cell>{item.invoiceItem.quantity}</Table.Cell>
            <Table.Cell>
              ₦{numberWithCommas(item.invoiceItem.unitPrice)}
            </Table.Cell>
            <Table.Cell>
              ₦{numberWithCommas(item.invoiceItem.amount)}{' '}
            </Table.Cell>
          </Table.Row>
        );
      });
      return items;
    }
  };

  // state = { :  }

  render() {
    const { data: invoiceRaw } = this.props.invoice;
    const invoice = invoiceRaw ? JSON.parse(invoiceRaw) : {};

    if (!invoiceRaw || invoiceRaw === 'null') {
      return <p>No Data</p>;
    }

    // return <p>No Data</p>;

    // if (invoiceRaw === 'null') {
    //   return <p>No Data</p>;
    // }

    return (
      <div className={styles.receipt}>
        <div className={styles.receipt__companyInfo}>
          <h5>JOY VETERINARY</h5>
          <p>
            342, Old Abeokuta Road
            <br />
            Gengento bus stop, Agege
            <br />
            08095988235
          </p>
          <p>
            <b>Sales Invoice!</b>
          </p>
          <hr />
        </div>
        <p>Customer: {invoice.customer.fullName || 'VALUED CUSTOMER'}</p>
        <p>Invoice#: {invoice.id}</p>
        <p>
          Transaction Date:{' '}
          {new Date(invoice.createdAt).toLocaleDateString('en-gb')}
        </p>
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
            {this.renderItems()}
            <Table.Row>
              <Table.Cell>Total</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell>₦{numberWithCommas(invoice.amount)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>Cashier: {invoice.postedBy}</p>
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

const mapStateToProps = ({ invoice }: { invoice: any }) => {
  return {
    invoice: invoice.singleInvoice,
  };
};

export default connect(mapStateToProps, {})(PrintedReceipt);
