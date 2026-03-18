import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { createInitialAdminFn } from '../../../controllers/auth.controller';
import routes from '../../../routing/routes';

const schema = z.object({
  fullName: z.string().min(3, 'Required'),
  username: z.string().min(3, 'Required'),
  password: z.string().min(3, 'Required'),
});

type FormValues = z.infer<typeof schema>;

const InitialAdminSetupForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const session = await createInitialAdminFn(values);

    if (!session) {
      return;
    }

    navigate(routes.INVOICE);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
          JV
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set Up JoyVet Sales
          </h1>
          <p className="text-sm text-muted-foreground">
            Create the first administrator account for this workstation.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Initial Admin</CardTitle>
          <CardDescription>
            This runs once for a new database before standard staff sign-in is
            available.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter the administrator name"
                type="text"
                autoComplete="name"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                type="text"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Create a password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating admin...' : 'Create Admin Account'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Save these credentials securely. Future access uses the normal
              login screen.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InitialAdminSetupForm;
