import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, RefreshCw, Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

import CreateProduct from './components/CreateProduct/CreateProduct';
import { numberWithCommas } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditProduct from './components/EditProduct/EditProduct';
import {
  createProductFn,
  getProductsFn,
  searchProductFn,
} from '../../controllers/product.controller';
import { IProduct } from '../../models/product';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const ProductsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [productId, setProductId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchProducts = async () => {
    setLoading(true);
    const response = await getProductsFn();
    setProducts(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchProducts();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setProductId('');
      };
      closeSideContent();
    };
  }, []);

  const handleNewProduct = async (values: Partial<IProduct>) => {
    await createProductFn(values);
    await fetchProducts();
  };

  const openSingleProduct = (id: any) => {
    setProductId(id);
    openSideContent(CONTENT_EDIT);
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfStockValue = () => {
    if (products.length === 0) {
      return 0;
    }
    return products
      .map((item) => {
        return item.stock * item.buyPrice;
      })
      .reduce(sum);
  };

  const renderRows = () => {
    const rows = products.map((each, index) => {
      return (
        <TableRow
          onClick={() => openSingleProduct(each.id)}
          key={each.id}
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell>{index + 1}</TableCell>
          <TableCell>{each.title}</TableCell>
          <TableCell>{each.stock}</TableCell>
          <TableCell>{numberWithCommas(each.buyPrice)}</TableCell>
          <TableCell>{numberWithCommas(each.sellPrice)}</TableCell>
          <TableCell>{numberWithCommas(each.sellPrice2)}</TableCell>
          <TableCell>{numberWithCommas(each.sellPrice3)}</TableCell>
          <TableCell>{numberWithCommas(each.stock * each.buyPrice)}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return (
        <CreateProduct
          createProductFn={handleNewProduct}
          refreshProducts={fetchProducts}
        />
      );
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditProduct productId={productId} refreshProducts={fetchProducts} />
      );
    }
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchProducts();
    }
  }, [searchValue]);

  const headerContent = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Create
        </Button>
        <Button variant="outline" size="icon" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={fetchProducts}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await searchProductFn(searchValue);
            setProducts(response);
          }}
        >
          <Input
            placeholder="Search Product"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </form>
      </div>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Products"
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
                <TableHead>No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Sell Price 2</TableHead>
                <TableHead>Sell Price 3</TableHead>
                <TableHead>Stock Value</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>{renderRows()}</TableBody>
          </Table>
          <div className="mt-2 text-sm font-semibold text-right">
            Total: ₦{numberWithCommas(sumOfStockValue())}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProductsScreen;
