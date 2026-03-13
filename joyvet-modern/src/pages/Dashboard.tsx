import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomers } from '@/store/slices/customerSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchInvoices } from '@/store/slices/invoiceSlice';
import { fetchPayments } from '@/store/slices/paymentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers, pagination: customerPagination } = useAppSelector((state) => state.customers);
  const { products, pagination: productPagination } = useAppSelector((state) => state.products);
  const { invoices, pagination: invoicePagination } = useAppSelector((state) => state.invoices);
  const { payments, pagination: paymentPagination } = useAppSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 1000 }));
    dispatch(fetchProducts({ page: 1, limit: 1000 }));
    dispatch(fetchInvoices({ page: 1, limit: 1000 }));
    dispatch(fetchPayments({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalProfit = invoices.reduce((sum, invoice) => sum + (invoice.profit || 0), 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const lowStockProducts = products.filter(product => product.stock <= product.reorderLevel);

  const stats = [
    {
      title: 'Total Customers',
      value: customerPagination?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Products',
      value: productPagination?.total || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Profit',
      value: formatCurrency(totalProfit),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Payments',
      value: formatCurrency(totalPayments),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your veterinary business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
            <CardDescription>Latest customer registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {customer.fullName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.fullName}</p>
                    <p className="text-xs text-gray-500">{customer.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(customer.balance)}</p>
                    <p className="text-xs text-gray-500">Balance</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">
                      {product.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.productCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.stock}</p>
                    <p className="text-xs text-gray-500">In Stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
