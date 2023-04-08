import React, { useEffect, useState } from 'react';
import { Table, Button, Icon } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import EditStoreInfo from './components/EditStoreInfo/EditStoreInfo';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import CreateStoreInfo from './components/CreateStoreInfo/CreateStoreInfo';
import {
  createStoreInfoFn,
  getStoreInfoFn,
} from '../../controllers/storeInfo.controller';
import { IStoreInfo } from '../../models/storeInfo';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const StoreInfoScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [storeInfoId, setStoreInfoId] = useState('');
  const [storeInfos, setStoreInfos] = useState<IStoreInfo[]>([]);

  const dispatch = useDispatch();

  const fetchStoreInfos = async () => {
    const response = await getStoreInfoFn();
    setStoreInfos(response);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchStoreInfos();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setStoreInfoId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

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
        color="blue"
        icon
        labelPosition="left"
        onClick={() => {
          openSideContent(CONTENT_CREATE);
        }}
      >
        <Icon inverted color="grey" name="add" />
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
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Store Name</Table.HeaderCell>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Phone Number</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {/* {storeInfos.map((each) => {
            return (
              <Table.Row
                onClick={() => openSingleStoreInfo(each.id)}
                key={each.id}
              >
                <Table.Cell>{each.storeName}</Table.Cell>
                <Table.Cell>{each.address}</Table.Cell>
                <Table.Cell>{each.phoneNumber}</Table.Cell>
              </Table.Row>
            );
          })} */}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default StoreInfoScreen;
