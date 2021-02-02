import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectExpenseState,
  getExpensesFn,
  createExpenseFn,
  // searchExpenseFn,
  filterExpensesFn,
} from '../../slices/expenseSlice';
import CreateExpense from './components/CreateExpense/CreateExpense';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditExpense from './components/EditExpense/EditExpense';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const ExpensesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [expenseId, setExpenseId] = useState('');
  // const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [expenseType, setExpenseType] = useState('');

  const dispatch = useDispatch();

  const expenseState = useSelector(selectExpenseState);

  const { data: expensesRaw, loading: expensesLoading } = expenseState.expenses;

  const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];

  const fetchExpenses = () => {
    dispatch(getExpensesFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setExpenseId('');
  };

  useEffect(() => {
    fetchExpenses();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewExpense = (values: any) => {
    dispatch(
      createExpenseFn(values, () => {
        fetchExpenses();
      })
    );
  };

  const openSingleExpense = (id: any) => {
    setExpenseId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = expenses.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleExpense(each.id)} key={each.id}>
          <Table.Cell>{each.type}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.date).toLocaleDateString('en-gb')}
          </Table.Cell>
          <Table.Cell>{each.note}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateExpense createExpenseFn={handleNewExpense} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditExpense expenseId={expenseId} />;
    }
    return null;
  };

  // const handleSearchChange = (e, { value }: { value: string }) => {
  //   setSearchValue(value);
  //   if (value.length > 0) {
  //     dispatch(searchExpenseFn(value));
  //   } else {
  //     fetchExpenses();
  //   }
  // };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmounts = () => {
    if (expenses.length === 0) {
      return 0;
    }
    return expenses
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };

  // const headerContent = () => {
  //   return (
  //     <>
  //       <Button
  //         color="blue"
  //         icon
  //         labelPosition="left"
  //         onClick={() => {
  //           openSideContent(CONTENT_CREATE);
  //         }}
  //       >
  //         <Icon inverted color="grey" name="add" />
  //         Create
  //       </Button>
  //       <Form.Input
  //         placeholder="Search Expense"
  //         onChange={handleSearchChange}
  //         value={searchValue}
  //       />
  //     </>
  //   );
  // };

  const filterExpenses = () => {
    dispatch(filterExpensesFn({ startDate, endDate, expenseType }));
  };

  const options = [
    { key: 1, text: 'All', value: 'all' },
    { key: 2, text: 'Advertisement', value: 'advertisement' },
    { key: 3, text: 'Rent', value: 'rent' },
  ];

  const headerContent = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
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

        <Form>
          <Form.Group style={{ marginBottom: 0 }}>
            <Form.Input
              label="Start Date"
              type="date"
              onChange={(e, { value }) => setStartDate(value)}
              value={startDate}
            />
            <Form.Input
              label="End Date"
              type="date"
              onChange={(e, { value }) => setEndDate(value)}
              value={endDate}
            />
            <Form.Select
              label="Type"
              options={options}
              placeholder="Choose type"
              onChange={(e, { value }) => setExpenseType(value)}
              value={expenseType}
            />
          </Form.Group>
        </Form>
        <div>
          <Button type="button" onClick={filterExpenses}>
            Filter
          </Button>
          <Button onClick={fetchExpenses} type="button">
            Reset
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Expenses"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {expensesLoading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Note</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{renderRows()}</Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell style={{ fontWeight: 'bold' }}>
                Total: ₦{numberWithCommas(sumOfAmounts())}
              </Table.HeaderCell>
              <Table.HeaderCell />
              <Table.HeaderCell />
            </Table.Row>
          </Table.Footer>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ExpensesScreen;
