/* eslint-disable react/jsx-indent */

import * as React from "react";
import dayjs from "dayjs";

import styles from "./PrintedReceipt.module.css";
import { numberWithCommas } from "../../utils/helpers";
import type { IInvoice } from "../../models/invoice";
import type { IStoreInfo } from "../../models/storeInfo";

interface ReceiptWrapperProps {
  invoice: IInvoice;
  storeInfo?: IStoreInfo;
}

const ReceiptWrapper = React.forwardRef<HTMLDivElement, ReceiptWrapperProps>(
  ({ invoice, storeInfo }: ReceiptWrapperProps, ref) => {
    return (
      <div ref={ref} className={styles.receipt}>
        <div className={styles.receipt__companyInfo}>
          <h5>{storeInfo?.storeName ?? "JOY VETERINARY"}</h5>
          <p>
            {storeInfo?.address ?? "37, Iganmode Road, Ota, Ogun State"}
            <br />
            {storeInfo?.phoneNumber ?? "08027634893"}
          </p>
          <p>
            <b>Sales Invoice!</b>
          </p>
          <hr />
        </div>
        <p>
          Customer:
          {invoice?.customer?.fullName || "VALUED CUSTOMER"}
        </p>
        <p>
          Invoice#:
          {invoice.id}
        </p>
        <p>
          Transaction Date:
          {dayjs(invoice.createdAt).format("DD/MM/YYYY")}
        </p>
        <table>
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Description</th>
              <th className="border px-2 py-1 text-left">Qty</th>
              <th className="border px-2 py-1 text-left">Price</th>
              <th className="border px-2 py-1 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products
              ? invoice.products.map((item) => (
                  <tr key={item.id}>
                    <td className="border px-2 py-1">{item.title}</td>
                    <td className="border px-2 py-1">
                      {item.invoiceItem?.quantity}
                    </td>
                    <td className="border px-2 py-1">
                      ₦
                      {item.invoiceItem?.unitPrice
                        ? numberWithCommas(item.invoiceItem.unitPrice)
                        : 0}
                    </td>
                    <td className="border px-2 py-1">
                      ₦
                      {item.invoiceItem?.amount
                        ? numberWithCommas(item.invoiceItem.amount)
                        : 0}
                    </td>
                  </tr>
                ))
              : null}
            <tr>
              <td className="border px-2 py-1">Total</td>
              <td className="border px-2 py-1" />
              <td className="border px-2 py-1" />
              <td className="border px-2 py-1">
                ₦{numberWithCommas(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>
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
        <p>
          <b>Products sold in good condition cannot be returned.</b>
        </p>
      </div>
    );
  },
);

export default ReceiptWrapper;
ReceiptWrapper.displayName = "ReceiptWrapper";
