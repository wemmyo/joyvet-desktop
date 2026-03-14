import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, RefreshCw } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import EditUser from './components/EditUser/EditUser';
import { IUser } from '../../models/user';
import { getUsersFn, createUserFn } from '../../controllers/user.controller';
import { useSidebarContext } from '../../contexts/SidebarContext';
import CreateUser from './components/CreateUser/CreateUser';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
// import { createStoreInfoTable } from '../../controllers/storeInfo.controller';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const UserScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchUsers = async () => {
    const response = await getUsersFn();
    setUsers(response);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchUsers();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setUserId('');
      };
      closeSideContent();
    };
  }, []);

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
          variant="default"
          size="sm"
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="mr-2 h-4 w-4" />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((each) => {
            return (
              <TableRow
                onClick={() => openSingleUser(each.id)}
                key={each.id}
                className="cursor-pointer"
              >
                <TableCell>{each.fullName}</TableCell>
                <TableCell>{each.username}</TableCell>
                <TableCell>{each.role}</TableCell>
                <TableCell>
                  {dayjs(each.createdAt).format('DD/MM/YYYY')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
};

export default UserScreen;
