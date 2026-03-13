import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

const SupplierHistory: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier History</h1>
        <p className="text-gray-600">View supplier purchase and payment history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Supplier ID: {id}
          </CardTitle>
          <CardDescription>
            View supplier's complete purchase and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will display the complete purchase and payment history for supplier ID: {id}.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierHistory;
