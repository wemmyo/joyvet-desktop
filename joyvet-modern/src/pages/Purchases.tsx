import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const Purchases: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
        <p className="text-gray-600">Manage supplier purchases and inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Purchase Management
          </CardTitle>
          <CardDescription>
            Create and track supplier purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain purchase order creation, tracking, and inventory management features.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchases;
