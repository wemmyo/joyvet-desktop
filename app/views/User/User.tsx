import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import EditUser from './components/EditUser/EditUser';
import { IUser } from '../../models/user';
import { getUsersFn, createUserFn } from '../../controllers/user.controller';
import { useSidebarContext } from '../../contexts/SidebarContext';
import CreateUser from './components/CreateUser/CreateUser';
import { Button } from '../../components/ui/button';
import { isAdmin } from '../../utils/helpers';
import routes from '../../routing/routes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
// import { createStoreInfoTable } from '../../controllers/storeInfo.controller';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const UserScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  useEffect(() => {
    if (!isAdmin()) navigate(routes.SALES);
  }, [navigate]);

  const fetchUsers = async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersFn({
        page: nextPage,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setUsers(response.rows ?? []);
      setTotal(response.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    void fetchUsers(page);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setUserId('');
      };
      closeSideContent();
    };
  }, [page]);

  const handleNewUser = async (values) => {
    await createUserFn(values);
    await fetchUsers();
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
      return <EditUser userId={userId} onUpdate={() => fetchUsers(page)} />;
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
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Users"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {error && <p className="text-destructive text-sm p-4">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div>
          <TableFrame>
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
                {users.length > 0 ? (
                  users.map((each) => {
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
                  })
                ) : (
                  <TableEmptyRow colSpan={4} message="No users found." />
                )}
              </TableBody>
            </Table>
          </TableFrame>
          <PaginationControls
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserScreen;
