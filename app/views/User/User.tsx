import React, { useEffect, useState } from 'react';
import { Table, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectUserState,
  getUsersFn,
  createUserFn,
} from '../../slices/userSlice';
import CreateUser from './components/CreateUser/CreateUser';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditUser from './components/EditUser/EditUser';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const UserScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [userId, setUserId] = useState('');

  const dispatch = useDispatch();
  const userState = useSelector(selectUserState);

  const { data: usersRaw } = userState.users;

  const users = usersRaw ? JSON.parse(usersRaw) : [];

  const fetchUsers = () => {
    dispatch(getUsersFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setUserId('');
  };

  useEffect(() => {
    fetchUsers();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewUser = (values: any) => {
    dispatch(
      createUserFn(values, () => {
        fetchUsers();
      })
    );
  };

  const openSingleUser = (id: any) => {
    setUserId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = users.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleUser(each.id)} key={each.id}>
          <Table.Cell>{each.fullName}</Table.Cell>
          <Table.Cell>{each.username}</Table.Cell>
          <Table.Cell>{each.role}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
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

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default UserScreen;
