import React, { useEffect, useState } from 'react';
import { Table, Button, Icon } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import EditUser from './components/EditUser/EditUser';
import { IUser } from '../../models/user';
import { getUsersFn, createUserFn } from '../../controllers/user.controller';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import CreateUser from './components/CreateUser/CreateUser';
// import { createStoreInfoTable } from '../../controllers/storeInfo.controller';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const UserScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);

  const dispatch = useDispatch();

  const fetchUsers = async () => {
    const response = await getUsersFn();
    setUsers(response);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchUsers();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setUserId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

  const handleNewUser = (values) => {
    createUserFn(values, () => {
      fetchUsers();
    });
  };

  const openSingleUser = (id) => {
    setUserId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateUser createUserFn={handleNewUser} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditUser userId={userId} />;
    }
    return null;
  };

  const headerContent = () => {
    return (
      <>
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
        <Button icon labelPosition="left" onClick={fetchUsers}>
          <Icon name="redo" />
          Refresh
        </Button>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Users"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Full Name</Table.HeaderCell>
            <Table.HeaderCell>Username</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Created</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map((each) => {
            return (
              <Table.Row onClick={() => openSingleUser(each.id)} key={each.id}>
                <Table.Cell>{each.fullName}</Table.Cell>
                <Table.Cell>{each.username}</Table.Cell>
                <Table.Cell>{each.role}</Table.Cell>
                <Table.Cell>
                  {moment(each.createdAt).format('DD/MM/YYYY')}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default UserScreen;
