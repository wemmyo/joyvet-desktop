import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectExpenseState,
  getExpensesFn,
  createExpenseFn,
  searchExpenseFn,
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
  const [searchValue, setSearchValue] = useState('');

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

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      dispatch(searchExpenseFn(value));
    } else {
      fetchExpenses();
    }
  };

  const headerContent = () => {
    return (
      <>
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
        <Form.Input
          placeholder="Search Expense"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
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
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ExpensesScreen;
