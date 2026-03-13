import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Invoices from '@/pages/Invoices';
import Payments from '@/pages/Payments';
import Purchases from '@/pages/Purchases';
import Suppliers from '@/pages/Suppliers';
import Expenses from '@/pages/Expenses';
import Receipts from '@/pages/Receipts';
import UsersPage from '@/pages/Users';
import StoreInfo from '@/pages/StoreInfo';
import CustomerHistory from '@/pages/CustomerHistory';
import ProductHistory from '@/pages/ProductHistory';
import SupplierHistory from '@/pages/SupplierHistory';
import AllPurchases from '@/pages/AllPurchases';
import Sales from '@/pages/Sales';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="store-info" element={<StoreInfo />} />
          <Route path="customer-history" element={<CustomerHistory />} />
          <Route path="product-history" element={<ProductHistory />} />
          <Route path="supplier-history" element={<SupplierHistory />} />
          <Route path="all-purchases" element={<AllPurchases />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
