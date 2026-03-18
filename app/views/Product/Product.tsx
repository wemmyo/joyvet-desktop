import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, RefreshCw, Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../components/ui/table-helpers';

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
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const ProductsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [productId, setProductId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const fetchProducts = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchProductFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
            search,
          })
        : await getProductsFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
          });
      setProducts(response.rows ?? []);
      setTotal(response.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    void fetchProducts(page, appliedSearch);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setProductId('');
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);

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
    const rows = products.map((each) => {
      return (
        <TableRow
          onClick={() => openSingleProduct(each.id)}
          key={each.id}
          className="cursor-pointer"
        >
          <TableCell>{each.title}</TableCell>
          <TableCell className="text-right">{each.stock}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.buyPrice)}
          </TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.sellPrice)}
          </TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.sellPrice2)}
          </TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.sellPrice3)}
          </TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.stock * each.buyPrice)}
          </TableCell>
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
        <Button
          variant="outline"
          onClick={() => {
            void fetchProducts(page, appliedSearch);
          }}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          }}
        >
          <Input
            placeholder="Search Product"
            onChange={(event) => {
              handleSearchChange(event);
              if (event.target.value.trim() === '' && appliedSearch !== '') {
                setAppliedSearch('');
                setPage(DEFAULT_PAGE);
              }
            }}
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
      {error && <p className="text-destructive text-sm p-4">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div ref={componentRef}>
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Buy Price</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead className="text-right">Sell Price 2</TableHead>
                  <TableHead className="text-right">Sell Price 3</TableHead>
                  <TableHead className="text-right">Stock Value</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length > 0 ? (
                  renderRows()
                ) : (
                  <TableEmptyRow colSpan={7} message="No products found." />
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>Total</TableCell>
                  <TableCell className="text-right">
                    ₦{numberWithCommas(sumOfStockValue())}
                  </TableCell>
                </TableRow>
              </TableFooter>
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

export default ProductsScreen;
