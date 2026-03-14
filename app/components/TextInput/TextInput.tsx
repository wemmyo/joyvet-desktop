import * as React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  field: any;
  form: any;
}

const TextInput: React.FC<TextInputProps> = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}: {
  [x: string]: any;
  field: any;
  form: any;
}) => {
  const hasError = touched[field.name] && errors[field.name];
  return (
    <div className="mb-3">
      {props.label && (
        <Label htmlFor={field.name} className="mb-1 block">
          {props.label}
        </Label>
      )}
      <Input
        id={field.name}
        {...field}
        {...props}
        className={hasError ? 'border-destructive' : ''}
      />
      {hasError && (
        <p className="text-sm text-destructive mt-1">{errors[field.name]}</p>
      )}
    </div>
  );
};

export default TextInput;
