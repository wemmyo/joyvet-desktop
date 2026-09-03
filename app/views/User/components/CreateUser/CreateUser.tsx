import { zodResolver } from '@hookform/resolvers/zod';
import type * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

const schema = z.object({
  fullName: z.string().min(1, 'Required'),
  username: z.string().optional().default(''),
  password: z.string().optional().default(''),
  role: z.string().min(1, 'Role is required'),
});

type FormValues = z.infer<typeof schema>;

export interface CreateUserProps {
  createUserFn: (values: {
    fullName: string;
    username: string;
    password: string;
    role: string;
  }) => Promise<unknown>;
}

const CreateUser: React.FC<CreateUserProps> = ({
  createUserFn,
}: CreateUserProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
      role: '' as string,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const created = await createUserFn({
      fullName: values.fullName,
      username: values.username || '',
      password: values.password || '',
      role: values.role || '',
    });
    if (!created) return;
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Full Name"
          type="text"
          {...register('fullName')}
        />
        {errors.fullName && (
          <span className="text-sm text-destructive">
            {errors.fullName.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Username"
          type="text"
          {...register('username')}
        />
        {errors.username && (
          <span className="text-sm text-destructive">
            {errors.username.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          placeholder="Password"
          type="password"
          {...register('password')}
        />
        {errors.password && (
          <span className="text-sm text-destructive">
            {errors.password.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="newbie">Newbie</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <span className="text-sm text-destructive">
            {errors.role.message}
          </span>
        )}
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
};
export default CreateUser;
