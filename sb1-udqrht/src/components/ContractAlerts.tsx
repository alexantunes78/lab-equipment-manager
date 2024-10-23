import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle } from 'lucide-react';
import { Equipment } from '../types/equipment';

interface ContractAlertsProps {
  equipment: Equipment[];
}

export function ContractAlerts({ equipment }: ContractAlertsProps) {
  const getDaysUntilExpiration = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcomingRenewals = equipment.filter(item => {
    const daysLeft = getDaysUntilExpiration(item.contractEndDate);
    return daysLeft >= 0 && daysLeft <= 60;
  });

  if (upcomingRenewals.length === 0) return null;

  // Group renewals by planner
  const renewalsByPlanner = upcomingRenewals.reduce((acc, item) => {
    const planner = item.planner || 'Unassigned';
    acc[planner] = (acc[planner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          Contracts Due for Renewal Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(renewalsByPlanner).map(([planner, count]) => (
            <div 
              key={planner}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-orange-100"
            >
              <div className="font-medium text-gray-900">
                {planner}
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                <span className="text-sm font-medium">
                  {count} {count === 1 ? 'contract' : 'contracts'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}