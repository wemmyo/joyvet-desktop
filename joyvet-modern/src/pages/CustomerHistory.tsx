import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

const CustomerHistory: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer History</h1>
        <p className="text-gray-600">View customer transaction history and details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Customer ID: {id}
          </CardTitle>
          <CardDescription>
            View customer's complete transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will display the complete transaction history for customer ID: {id}.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerHistory;
