import { Plus, Printer, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import { useSidebarContext } from '../../contexts/SidebarContext';
import {
  createProductFn,
  getProductsFn,
  searchProductFn,
} from '../../controllers/product.controller';
import type { IProduct } from '../../models/product';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  type ProductListQuery,
} from '../../types/pagination';
import { numberWithCommas } from '../../utils/helpers';
import CreateProduct from './components/CreateProduct/CreateProduct';
import EditProduct from './components/EditProduct/EditProduct';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

type CatalogFilter = 'active' | 'discontinued' | 'all';

const ProductsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [productId, setProductId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('active');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    page,
    setPage,
    pageSize,
    showAll,
    onPageSizeChange,
    onShowAllChange,
  } = usePagination();
  const [total, setTotal] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [printRows, setPrintRows] = useState<IProduct[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintRows([]),
  });

  const catalogQuery = (): Pick<ProductListQuery, 'filter'> =>
    catalogFilter === 'all' ? {} : { filter: catalogFilter };

  const fetchProducts = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchProductFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
            search,
            ...catalogQuery(),
          })
        : await getProductsFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
            ...catalogQuery(),
          });
      setProducts(response.rows ?? []);
      setTotal(response.total ?? 0);
      setStockValue(response.totals?.stockValue ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the entire filtered set and print it (all pages, not just the current one).
  const handlePrintAll = async () => {
    try {
      const response = appliedSearch
        ? await searchProductFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            search: appliedSearch,
            all: true,
            ...catalogQuery(),
          })
        : await getProductsFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            all: true,
            ...catalogQuery(),
          });
      setPrintRows(response.rows ?? []);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to prepare print'
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handlePrint is stable
  useEffect(() => {
    if (printRows.length > 0) {
      handlePrint?.();
    }
  }, [printRows]);

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchProducts and closeSideBar are stable
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
  }, [appliedSearch, catalogFilter, page, pageSize, showAll]);

  const handleNewProduct = async (values: Partial<IProduct>) => {
    return createProductFn(values, () => {
      void fetchProducts();
    });
  };

  const openSingleProduct = (id: string | number) => {
    setProductId(String(id));
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = (list: IProduct[]) => {
    const rows = list.map((each) => {
      return (
        <TableRow
          onClick={() => openSingleProduct(each.id)}
          key={each.id}
          className={
            each.discontinued ? 'cursor-pointer opacity-60' : 'cursor-pointer'
          }
        >
          <TableCell>
            <span className="flex items-center gap-2">
              {each.title}
              {each.discontinued ? (
                <span className="text-xs text-muted-foreground">
                  Discontinued
                </span>
              ) : null}
            </span>
          </TableCell>
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

  // Shared table markup. `showEmpty` renders the empty-state row when there are
  // no rows (used for the on-screen table; the hidden print table omits it).
  const renderProductsTable = (list: IProduct[], showEmpty: boolean) => (
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
          {list.length > 0 ? (
            renderRows(list)
          ) : showEmpty ? (
            <TableEmptyRow colSpan={7} message="No products found." />
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total</TableCell>
            <TableCell className="text-right">
              ₦{numberWithCommas(stockValue)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableFrame>
  );

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
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            void handlePrintAll();
          }}
        >
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
        <Select
          value={catalogFilter}
          onValueChange={(value) => {
            setCatalogFilter(value as CatalogFilter);
            setPage(DEFAULT_PAGE);
          }}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
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
        <div>
          {renderProductsTable(products, true)}
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
            showAll={showAll}
            onShowAllChange={onShowAllChange}
          />
        </div>
      )}
      {/* Hidden full-dataset table used only for printing all pages. */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>{renderProductsTable(printRows, false)}</div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsScreen;
