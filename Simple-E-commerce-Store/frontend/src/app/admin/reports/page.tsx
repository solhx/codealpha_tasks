'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  icon: any;
  lastGenerated?: string;
}

const reports: Report[] = [
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Detailed breakdown of all sales and revenue',
    icon: TrendingUp,
    lastGenerated: '2024-01-15'
  },
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Current stock levels and inventory valuation',
    icon: Package,
    lastGenerated: '2024-01-14'
  },
  {
    id: 'customers',
    name: 'Customer Report',
    description: 'Customer demographics and purchase history',
    icon: Users,
    lastGenerated: '2024-01-13'
  },
  {
    id: 'orders',
    name: 'Orders Report',
    description: 'Order status, fulfillment, and delivery metrics',
    icon: ShoppingCart,
    lastGenerated: '2024-01-12'
  }
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true);
    setSelectedReport(reportId);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    // In a real app, this would trigger a download or show the report
    alert(`Report "${reportId}" generated successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download business reports
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report Date Range
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <report.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
            
            {report.lastGenerated && (
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
              </p>
            )}
            
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleGenerateReport(report.id)}
                isLoading={isGenerating && selectedReport === report.id}
              >
                <FileText className="w-4 h-4 mr-1" />
                Generate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download Last
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Reports
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Report Name</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Generated</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Date Range</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="py-3 text-sm text-gray-900 dark:text-white">
                    {report.name}
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                    {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                    Jan 1 - Jan 15, 2024
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}