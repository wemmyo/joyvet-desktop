import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import EditStoreInfo from './components/EditStoreInfo/EditStoreInfo';
import { useSidebarContext } from '../../contexts/SidebarContext';
import CreateStoreInfo from './components/CreateStoreInfo/CreateStoreInfo';
import {
  createStoreInfoFn,
  getStoreInfoFn,
} from '../../controllers/storeInfo.controller';
import { IStoreInfo } from '../../models/storeInfo';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const StoreInfoScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [storeInfoId, setStoreInfoId] = useState('');
  const [storeInfos, setStoreInfos] = useState<IStoreInfo[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchStoreInfos = async () => {
    const response = await getStoreInfoFn();
    setStoreInfos(response);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchStoreInfos();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setStoreInfoId('');
      };
      closeSideContent();
    };
  }, []);

  const handleNewStoreInfo = (values) => {
    createStoreInfoFn(values, () => {
      fetchStoreInfos();
    });
  };

  const openSingleStoreInfo = (id) => {
    setStoreInfoId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateStoreInfo createStoreInfoFn={handleNewStoreInfo} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditStoreInfo storeInfoId={storeInfoId} />;
    }
    return null;
  };

  const headerContent = () => {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          openSideContent(CONTENT_CREATE);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create
      </Button>
    );
  };

  return (
    <DashboardLayout
      screenTitle="StoreInfos"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* {storeInfos.map((each) => {
            return (
              <TableRow
                onClick={() => openSingleStoreInfo(each.id)}
                key={each.id}
                className="cursor-pointer"
              >
                <TableCell>{each.storeName}</TableCell>
                <TableCell>{each.address}</TableCell>
                <TableCell>{each.phoneNumber}</TableCell>
              </TableRow>
            );
          })} */}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
};

export default StoreInfoScreen;
