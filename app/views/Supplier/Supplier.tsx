import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, RefreshCw, Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditSupplier from './components/EditSupplier/EditSupplier';
import {
  getSuppliersFn,
  createSupplierFn,
  searchSupplierFn,
} from '../../controllers/supplier.controller';
import { ISupplier } from '../../models/supplier';
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

const SuppliersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    const response = await getSuppliersFn();
    setSuppliers(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchSuppliers();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setSupplierId('');
      };
      closeSideContent();
    };
  }, []);

  const handleNewSupplier = async (values) => {
    await createSupplierFn(values);
    fetchSuppliers();
  };

  const openSingleSupplier = (id) => {
    setSupplierId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = suppliers.map((each) => {
      return (
        <TableRow
          key={each.id}
          className="cursor-pointer"
          onClick={() => openSingleSupplier(each.id)}
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
      return <CreateSupplier createSupplierFn={handleNewSupplier} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditSupplier supplierId={Number(supplierId)} />;
    }
    return null;
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchSuppliers();
    }
  }, [searchValue]);

  const sumOfBalances = () => {
    if (suppliers.length === 0) {
      return 0;
    }
    return suppliers
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
        <Button variant="outline" size="sm" onClick={fetchSuppliers}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="icon" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Input
            placeholder="Search Supplier"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                const response = await searchSupplierFn(searchValue);
                setSuppliers(response);
              }
            }}
          />
        </div>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Suppliers"
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

export default SuppliersScreen;
