import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { FunctionalComponent } from '../Print';
// import PrintedReceipt from '../../components/PrintedReceipt/PrintedReceipt';
// export interface OverviewScreenProps {}

const OverviewScreen = () => {
  return (
    <DashboardLayout screenTitle="Overview">
      <FunctionalComponent />
      {/* <PrintedReceipt /> */}
    </DashboardLayout>
  );
};

export default OverviewScreen;
