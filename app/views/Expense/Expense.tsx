/* eslint-disable react/jsx-one-expression-per-line */
import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectExpenseState,
  createExpenseFn,
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
const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const ExpensesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [expenseId, setExpenseId] = useState('');
  // const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const dispatch = useDispatch();

  const expenseState = useSelector(selectExpenseState);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { data: expensesRaw, loading: expensesLoading } = expenseState.expenses;

  const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];

  const filterExpenses = () => {
    dispatch(filterExpensesFn({ startDate, endDate }));
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmounts = (values) => {
    if (values.length === 0) {
      return 0;
    }
    return values
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };

  const groupBy = (xs, key) => {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
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
    filterExpenses();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewExpense = (values: any) => {
    dispatch(
      createExpenseFn(values, () => {
        filterExpenses();
      })
    );
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
        return (
          <Fragment key={title}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{title.toUpperCase()}</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Note</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {itemSection}

              <Table.Row>
                <Table.Cell />
                <Table.Cell>
                  <strong>₦{numberWithCommas(itemSum)}</strong>
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
            </Table.Body>
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
      return <EditExpense expenseId={expenseId} />;
    }
    return null;
  };

  const headerContent = () => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
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
        <Button onClick={handlePrint} icon="print" />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
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
            </Form.Group>
          </Form>
          <div style={{ marginLeft: '1rem' }}>
            <Button type="button" onClick={filterExpenses} primary>
              Filter
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  filterExpensesFn({
                    startDate: TODAYS_DATE,
                    endDate: TODAYS_DATE,
                  })
                );
              }}
              type="button"
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
      {expensesLoading ? (
        <Loader active inline="centered" />
      ) : (
        <div ref={componentRef}>
          {headerContent()}
          <h1>Total: ₦{numberWithCommas(sumOfAmounts(expenses))}</h1>
          <Table celled>
            {renderRows()}
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell>
                  <strong>
                    Total: ₦{numberWithCommas(sumOfAmounts(expenses))}
                  </strong>
                </Table.HeaderCell>
                <Table.HeaderCell />
                <Table.HeaderCell />
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExpensesScreen;
