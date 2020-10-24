import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { FunctionalComponent } from '../Print';
// export interface OverviewScreenProps {}

const OverviewScreen = () => {
  return (
    <DashboardLayout screenTitle="Overview">
      <FunctionalComponent />
    </DashboardLayout>
  );
};

export default OverviewScreen;
