import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon } from 'lucide-react';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and their permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Create, edit, and manage user accounts and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              User management functionality is being implemented.
            </p>
            <Button disabled>Add User</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
