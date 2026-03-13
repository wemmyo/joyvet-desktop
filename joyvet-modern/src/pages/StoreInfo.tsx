import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const StoreInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Information</h1>
        <p className="text-gray-600">Manage business details and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Business Settings
          </CardTitle>
          <CardDescription>
            Configure business information and system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will contain business information management, logo upload, and system configuration features.
            Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreInfo;
