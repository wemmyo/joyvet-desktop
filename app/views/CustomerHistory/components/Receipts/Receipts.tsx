import * as React from 'react';

export interface CustomerHistoryReceiptsProps {
  data: any[];
}

const CustomerHistoryReceipts: React.SFC<CustomerHistoryReceiptsProps> = ({
  data,
}) => {
  return (
    <div>
      <p>The receipts</p>
    </div>
  );
};

export default CustomerHistoryReceipts;
