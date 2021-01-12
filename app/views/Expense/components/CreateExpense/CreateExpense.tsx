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
          <div className="field">
            <label htmlFor="type">Sale Type</label>
            <Field
              id="type"
              name="type"
              component="select"
              className="ui dropdown"
            >
              <option value="" disabled hidden>
                Select Type
              </option>
              <option>advertisement</option>
              <option>bank charges % cto</option>
              <option>diesel & fuel</option>
              <option>generator maintenance</option>
              <option>miscellaneous</option>
              <option>office</option>
              <option>pr/gifts</option>
              <option>printing & stationary</option>
              <option>rent</option>
              <option>telephone</option>
              <option>training</option>
              <option>transport</option>
              <option>salary</option>
              <option>staff bonus</option>
              <option>vehicle maintenance</option>
              <option>vehicle fuel</option>
              <option>water & gas</option>
              <option>others</option>
            </Field>
          </div>
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
