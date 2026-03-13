import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const Receipts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
        <p className="text-gray-600">Manage sales receipts and payment confirmations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Receipt Management
          </CardTitle>
          <CardDescription>
            Generate and manage sales receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain receipt generation, printing, and management features.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipts;
