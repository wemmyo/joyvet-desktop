import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const Sales: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600">View sales analytics and reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Sales Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive sales reporting and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain sales analytics, charts, reports, and performance metrics.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
