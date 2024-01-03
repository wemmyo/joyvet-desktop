/* eslint-disable react/jsx-indent */

import * as React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';

import styles from './PrintedReceipt.css';
import { numberWithCommas } from '../../utils/helpers';
import { IInvoice } from '../../models/invoice';

interface ReceiptWrapperProps {
  invoice: IInvoice;
}

const ReceiptWrapper = React.forwardRef<HTMLDivElement, ReceiptWrapperProps>(
  ({ invoice }: ReceiptWrapperProps, ref) => {
    return (
      <div ref={ref} className={styles.receipt}>
        <div className={styles.receipt__companyInfo}>
          <h5>Prudent Agric Ventures</h5>
          <p>
            56, Agbelekale, Ekoro Road,
            <br />
            Abule Egba, Lagos State
            <br />
            08051161056, 08181731679, 09162565795
          </p>
          <p>
            <b>Sales Invoice!</b>
          </p>
          <hr />
        </div>
        <p>
          Customer:
          {invoice?.customer?.fullName || 'VALUED CUSTOMER'}
        </p>
        <p>
          Invoice#:
          {invoice.id}
        </p>
        <p>
          Transaction Date:
          {moment(invoice.createdAt).format('DD/MM/YYYY')}
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
            {invoice.products
              ? invoice.products.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.title}</Table.Cell>
                    <Table.Cell>{item.invoiceItem?.quantity}</Table.Cell>
                    <Table.Cell>
                      ₦
                      {item.invoiceItem?.unitPrice
                        ? numberWithCommas(item.invoiceItem.unitPrice)
                        : 0}
                    </Table.Cell>
                    <Table.Cell>
                      ₦
                      {item.invoiceItem?.amount
                        ? numberWithCommas(item.invoiceItem.amount)
                        : 0}
                    </Table.Cell>
                  </Table.Row>
                ))
              : null}
            <Table.Row>
              <Table.Cell>Total</Table.Cell>
              <Table.Cell />
              <Table.Cell />
              <Table.Cell>₦{numberWithCommas(invoice.amount)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>
          Cashier:
          {invoice.postedBy}
        </p>
        <p>
          <b>
            Please, Ensure you check all item(s) given to you with your invoice
            before leaving the counter.
          </b>
        </p>
      </div>
    );
  }
);

export default ReceiptWrapper;
ReceiptWrapper.displayName = 'ReceiptWrapper';

// const ReceiptWrapper = React.forwardRef({ invoice },ref) => {
//   return (
//     <div ref={ref} className={styles.receipt}>
//       <div className={styles.receipt__companyInfo}>
//         <h5>JOY VETERINARY</h5>
//         <p>
//           37, Iganmode Road
//           <br />
//           Ota, Ogun State
//           <br />
//           08095988354, 08095988693
//         </p>
//         <p>
//           <b>Sales Invoice!</b>
//         </p>
//         <hr />
//       </div>
//       <p>
//         Customer:
//         {invoice.customer.fullName || 'VALUED CUSTOMER'}
//       </p>
//       <p>
//         Invoice#:
//         {invoice.id}
//       </p>
//       <p>
//         Transaction Date:{' '}
//         {new Date(invoice.createdAt).toLocaleDateString('en-gb')}
//       </p>
//       <Table basic celled>
//         <Table.Header>
//           <Table.Row>
//             <Table.HeaderCell>Description</Table.HeaderCell>
//             <Table.HeaderCell>Qty</Table.HeaderCell>
//             <Table.HeaderCell>Price</Table.HeaderCell>
//             <Table.HeaderCell>Amount</Table.HeaderCell>
//           </Table.Row>
//         </Table.Header>

//         <Table.Body>
//           {/* {this.renderItems()} */}
//           {invoice.products.map((item) => (
//             <Table.Row key={item.id}>
//               <Table.Cell>{item.title}</Table.Cell>
//               <Table.Cell>{item.invoiceItem.quantity}</Table.Cell>
//               <Table.Cell>
//                 ₦{numberWithCommas(item.invoiceItem.unitPrice)}
//               </Table.Cell>
//               <Table.Cell>
//                 ₦{numberWithCommas(item.invoiceItem.amount)}
//               </Table.Cell>
//             </Table.Row>
//           ))}
//           <Table.Row>
//             <Table.Cell>Total</Table.Cell>
//             <Table.Cell />
//             <Table.Cell />
//             <Table.Cell>₦{numberWithCommas(invoice.amount)}</Table.Cell>
//           </Table.Row>
//         </Table.Body>
//       </Table>
//       <p>
//         Cashier:
//         {invoice.postedBy}
//       </p>
//       <p>
//         <b>
//           Please, Ensure you check all item(s) given to you with your invoice
//           before leaving the counter.
//         </b>
//       </p>
//     </div>
//   );
// };
