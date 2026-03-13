import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/store/slices/customerSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers, loading, pagination } = useAppSelector((state) => state.customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 100, search: searchTerm }));
  }, [dispatch, searchTerm]);

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber?.includes(searchTerm)
  );

  const handleCreateCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch(createCustomer(data));
    setIsCreateDialogOpen(false);
  };

  const handleEditCustomer = (data: Partial<Customer> & { id: number }) => {
    dispatch(updateCustomer(data));
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch(deleteCustomer(customerId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter customer information</DialogDescription>
            </DialogHeader>
            <CustomerForm onSubmit={handleCreateCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {pagination?.total || 0} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Price Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell>{customer.phoneNumber || '-'}</TableCell>
                  <TableCell>{customer.address || '-'}</TableCell>
                  <TableCell>{formatCurrency(customer.balance)}</TableCell>
                  <TableCell>{customer.maxPriceLevel}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleEditCustomer}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: any) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: customer || {
      fullName: '',
      address: '',
      phoneNumber: '',
      balance: 0,
      maxPriceLevel: 1,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          {...register('fullName', { required: 'Full name is required' })}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          {...register('phoneNumber')}
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...register('address')}
        />
      </div>

      <div>
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          type="number"
          {...register('balance', { valueAsNumber: true })}
        />
      </div>

      <div>
        <Label htmlFor="maxPriceLevel">Max Price Level</Label>
        <Input
          id="maxPriceLevel"
          type="number"
          {...register('maxPriceLevel', { valueAsNumber: true, min: 1, max: 3 })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {customer ? 'Update' : 'Create'} Customer
        </Button>
      </div>
    </form>
  );
};

export default Customers;
