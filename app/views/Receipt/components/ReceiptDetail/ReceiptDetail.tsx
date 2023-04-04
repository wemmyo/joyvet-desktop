import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Table, Button } from 'semantic-ui-react';
import {
  getSingleReceiptFn,
  deleteReceiptFn,
  getReceiptsFn,
} from '../../../../controllers/receipt.controller';
import { IReceipt } from '../../../../models/receipt';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface ReceiptDetailProps {
  receiptId: string | number;
}

const ReceiptDetail: React.SFC<ReceiptDetailProps> = ({
  receiptId,
}: ReceiptDetailProps) => {
  const [singleReceipt, setSingleReceipt] = useState<IReceipt>({} as IReceipt);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSingleReceiptFn(receiptId);
      setSingleReceipt(response);
      setLoading(false);
    };

    fetchData();
  }, [receiptId]);

  const handleDelete = async () => {
    await deleteReceiptFn(receiptId);
    await getReceiptsFn();
    dispatch(closeSideContentFn());
  };

  const {
    customer,
    amount,
    note,
    createdAt,
    paymentMethod,
    // paymentType,
    bank,
  } = singleReceipt;

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Customer</Table.Cell>
            <Table.Cell>{customer ? customer.fullName : ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Customer balance</Table.Cell>
            <Table.Cell>{customer ? customer.balance : 0.0}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>{amount || ''}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>Payment Method</Table.Cell>
            <Table.Cell>{paymentMethod || ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Bank</Table.Cell>
            <Table.Cell>{bank || ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Note</Table.Cell>
            <Table.Cell>{note || ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Date</Table.Cell>
            <Table.Cell>
              {new Date(createdAt).toLocaleDateString('en-gb') || ''}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Button onClick={() => handleDelete()} type="Submit" negative>
        Delete
      </Button>
    </>
  );
};

export default ReceiptDetail;
