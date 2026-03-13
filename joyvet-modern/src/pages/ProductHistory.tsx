import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const ProductHistory: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product History</h1>
        <p className="text-gray-600">View product sales and purchase history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Product ID: {id}
          </CardTitle>
          <CardDescription>
            View product's complete sales and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will display the complete sales and purchase history for product ID: {id}.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductHistory;
