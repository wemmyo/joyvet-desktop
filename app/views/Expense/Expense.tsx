import React, {
  Fragment,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import { Plus, Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

import CreateExpense from './components/CreateExpense/CreateExpense';
import { numberWithCommas } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditExpense from './components/EditExpense/EditExpense';
import { IExpense } from '../../models/expense';
import {
  filterExpensesFn,
  createExpenseFn,
} from '../../controllers/expense.controller';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';
const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const ExpensesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [expenseId, setExpenseId] = useState('');
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const filterExpenses = useCallback(async () => {
    setLoading(true);
    const response = await filterExpensesFn({ startDate, endDate });
    setExpenses(response);
    setLoading(false);
  }, [endDate, startDate]);

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmounts = (values: IExpense[] = []) => {
    if (values.length === 0) {
      return 0;
    }
    return values
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };

  const groupBy = (xs: any[] = [], key: string): { [key: string]: any[] } => {
    return xs.reduce(
      (rv: { [key: string]: any[] }, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      },
      {} as { [key: string]: any[] }
    );
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    filterExpenses();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setExpenseId('');
      };
      closeSideContent();
    };
  }, [filterExpenses]);

  const handleNewExpense = async (values) => {
    await createExpenseFn(values);
    filterExpenses();
  };

  const openSingleExpense = (id: any) => {
    setExpenseId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const groupedObject = groupBy(expenses, 'type');

    const allSections = Object.entries(groupedObject).map(
      ([title, itemArray]) => {
        const itemSum = sumOfAmounts(itemArray);
        const itemSection = itemArray.map((each) => {
          return (
            <TableRow
              onClick={() => openSingleExpense(each.id)}
              key={each.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{each.type}</TableCell>
              <TableCell>{numberWithCommas(each.amount)}</TableCell>
              <TableCell>
                {new Date(each.date).toLocaleDateString('en-gb')}
              </TableCell>
              <TableCell>{each.note}</TableCell>
            </TableRow>
          );
        });
        return (
          <Fragment key={title}>
            <TableHeader>
              <TableRow>
                <TableHead>{title.toUpperCase()}</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {itemSection}

              <TableRow>
                <TableCell />
                <TableCell>
                  <strong>₦{numberWithCommas(itemSum)}</strong>
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Fragment>
        );
      }
    );

    return allSections;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateExpense createExpenseFn={handleNewExpense} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditExpense
          expenseId={Number(expenseId)}
          refreshExpenses={filterExpenses}
        />
      );
    }
    return null;
  };

  const headerContent = () => {
    return (
      <div className="flex items-center justify-between flex-1 flex-wrap gap-2">
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
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex gap-2">
            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                onChange={(e) => setStartDate(e.target.value)}
                value={startDate}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                onChange={(e) => setEndDate(e.target.value)}
                value={endDate}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={filterExpenses}>
              Filter
            </Button>
            <Button
              onClick={async () => {
                const response = await filterExpensesFn({
                  startDate: TODAYS_DATE,
                  endDate: TODAYS_DATE,
                });
                setExpenses(response);
              }}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout screenTitle="Expenses" rightSidebar={renderSideContent()}>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div ref={componentRef}>
          {headerContent()}
          <h1 className="text-xl font-bold my-3">
            Total: ₦{numberWithCommas(sumOfAmounts(expenses))}
          </h1>
          <Table>{renderRows()}</Table>
          <div className="mt-2 text-sm font-semibold text-right">
            Total: ₦{numberWithCommas(sumOfAmounts(expenses))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExpensesScreen;
