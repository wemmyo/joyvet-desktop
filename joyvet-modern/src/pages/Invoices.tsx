import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const Invoices: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600">Manage sales invoices and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Invoice Management
          </CardTitle>
          <CardDescription>
            Create and manage sales invoices for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain invoice creation, management, and reporting features.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
