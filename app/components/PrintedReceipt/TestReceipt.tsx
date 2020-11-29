import * as React from 'react';
import PrintedReceipt from './PrintedReceipt';

export interface TestReceiptProps {}

export interface TestReceiptState {}

class TestReceipt extends React.Component<TestReceiptProps, TestReceiptState> {
  render() {
    return <PrintedReceipt />;
  }
}

export default TestReceipt;
