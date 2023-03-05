import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleExpenseFn,
  selectExpenseState,
  updateExpenseFn,
  deleteExpenseFn,
} from '../../../../slices/expenseSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditExpenseProps {
  expenseId: number;
}

const EditExpense: React.FC<EditExpenseProps> = ({
  expenseId,
}: EditExpenseProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleExpenseFn(expenseId));
  };

  useEffect(fetchData, [expenseId, dispatch]);

  const expenseState = useSelector(selectExpenseState);

  const { data: expense } = expenseState.singleExpense;

  // console.log(expense);

  const { type, amount, date, note } = expense;

  const handleDeleteExpense = () => {
    dispatch(
      deleteExpenseFn(expenseId, () => {
        dispatch(closeSideContentFn());
      })
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        type: type || '',
        amount: amount || '',
        date: moment(date).format('YYYY-MM-DD') || '',
        note: note || '',
      }}
      // validationSchema={EditExpenseSchema}
      onSubmit={(values) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateExpenseFn(values, expenseId, () => {
            dispatch(closeSideContentFn());
          })
        );
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="type"
            placeholder="Type"
            label="Type"
            type="text"
            component={TextInput}
          />
          <Field
            name="amount"
            placeholder="Amount"
            label="Amount"
            type="number"
            component={TextInput}
          />
          <Field
            name="date"
            placeholder="Date"
            label="Date"
            type="date"
            component={TextInput}
          />
          <Field
            name="note"
            placeholder="Note"
            label="Note"
            type="text"
            component={TextInput}
          />

          <Button onClick={() => handleSubmit()} type="Submit" fluid primary>
            Update
          </Button>
          <Button
            style={{ marginTop: '1rem' }}
            onClick={handleDeleteExpense}
            type="button"
            fluid
            negative
          >
            Delete
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditExpense;
