import React from 'react';
import ReactToPrint from 'react-to-print';
import ComponentToPrint from '../../components/PrintedReceipt/ReceiptWrapper';

class Example extends React.Component {
  render() {
    return (
      <div>
        <ReactToPrint
          trigger={() => <button type="button">Print this out!</button>}
          content={() => this.componentRef}
        />
        <ComponentToPrint ref={(el) => (this.componentRef = el)} />
      </div>
    );
  }
}

export default Example;
