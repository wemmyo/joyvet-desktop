import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';

const CreateExpenseSchema = Yup.object().shape({
  type: Yup.string().required('Required'),
});

export interface CreateExpenseProps {
  createExpenseFn: (values: any) => void;
}

const CreateExpense: React.FC<CreateExpenseProps> = ({
  createExpenseFn,
}: CreateExpenseProps) => {
  return (
    <Formik
      initialValues={{
        type: '',
        amount: '',
        date: '',
        note: '',
      }}
      validationSchema={CreateExpenseSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        createExpenseFn(values);
        actions.resetForm();
        // console.log(values);
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
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreateExpense;
