import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const Expenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track business expenses and costs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Expense Management
          </CardTitle>
          <CardDescription>
            Record and categorize business expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain expense recording, categorization, and reporting features.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
