import * as React from 'react';
import { remote } from 'electron';
import fs from 'fs';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { FunctionalComponent } from '../Print';
// import PrintedReceipt from '../../components/PrintedReceipt/PrintedReceipt';
// export interface OverviewScreenProps {}
export function createNewDatabase() {
  return new Promise((resolve) => {
    remote.dialog.showSaveDialog(
      remote.getCurrentWindow(),
      {
        title: 'Select folder',
        defaultPath: 'frappe-books.db',
      },
      (filePath: any) => {
        if (filePath) {
          if (!filePath.endsWith('.db')) {
            filePath = filePath + '.db';
          }
          if (fs.existsSync(filePath)) {
            console.log('Already exists');

            // showMessageDialog({
            //   // prettier-ignore
            //   message: _('A file exists with the same name and it will be overwritten. Are you sure you want to continue?'),
            //   buttons: [
            //     {
            //       label: _('Overwrite'),
            //       action() {
            //         fs.unlinkSync(filePath);
            //         resolve(filePath);
            //       },
            //     },
            //     { label: _('Cancel'), action() {} },
            //   ],
            // });
          } else {
            resolve(filePath);
          }
        }
      }
    );
  });
}

const OverviewScreen = () => {
  return (
    <DashboardLayout screenTitle="Overview">
      <FunctionalComponent />
      {/* <PrintedReceipt /> */}
      <button onClick={() => createNewDatabase()}>Open</button>
    </DashboardLayout>
  );
};

export default OverviewScreen;
