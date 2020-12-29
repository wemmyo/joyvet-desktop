import * as React from 'react';
import PrintedReceipt from './PrintedReceipt';

// eslint-disable-next-line react/prefer-stateless-function
class ReceiptWrapper extends React.Component {
  render() {
    return <PrintedReceipt />;
  }
}

export default ReceiptWrapper;
