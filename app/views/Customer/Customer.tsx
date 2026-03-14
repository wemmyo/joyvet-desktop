import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, RefreshCw, Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditCustomer from './components/EditCustomer/EditCustomer';
import {
  createCustomerFn,
  getCustomersFn,
  searchCustomerFn,
} from '../../controllers/customer.controller';
import { ICustomer } from '../../models/customer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

const CustomersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchCustomers = async () => {
    setLoading(true);
    const response = await getCustomersFn();
    setCustomers(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchCustomers();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setCustomerId('');
      };
      closeSideContent();
    };
  }, []);

  const handleNewCustomer = async (values) => {
    await createCustomerFn(values);
    await fetchCustomers();
  };

  const openSingleCustomer = (id) => {
    setCustomerId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = customers.map((each) => {
      return (
        <TableRow
          key={each.id}
          className="cursor-pointer"
          onClick={() => openSingleCustomer(each.id)}
        >
          <TableCell>{each.fullName}</TableCell>
          <TableCell>{each.address}</TableCell>
          <TableCell>{each.phoneNumber}</TableCell>
          <TableCell>{numberWithCommas(each.balance)}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateCustomer createCustomerFn={handleNewCustomer} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditCustomer customerId={Number(customerId)} />;
    }
    return null;
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchCustomers();
    }
  }, [searchValue]);

  const sumOfBalances = () => {
    if (customers.length === 0) {
      return 0;
    }
    return customers
      .map((item: any) => {
        return item.balance;
      })
      .reduce(sum);
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
        <Button variant="outline" size="sm" onClick={fetchCustomers}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="icon" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Input
            placeholder="Search Customer"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                const response = await searchCustomerFn(searchValue);
                setCustomers(response);
              }
            }}
          />
        </div>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div ref={componentRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderRows()}</TableBody>
          </Table>
          {isAdmin() ? (
            <div className="mt-2 text-right font-semibold">
              Total: ₦{numberWithCommas(sumOfBalances())}
            </div>
          ) : null}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomersScreen;
