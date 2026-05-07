'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface MonthlyData {
  month: string;
  monthShort: string;
  year: number;
  monthNum: number;
  revenue: number;
  orders: number;
  paidOrders: number;
}

interface TopProduct {
  _id: string;
  name: string;
  image: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopCategory {
  _id: string;
  totalSold: number;
  totalRevenue: number;
}

interface OrderStatus {
  _id: string;
  count: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  conversionRate: number;
  currentPeriod: {
    revenue: number;
    orders: number;
    customers: number;
  };
  previousPeriod: {
    revenue: number;
    orders: number;
    customers: number;
  };
  changes: {
    revenue: number;
    orders: number;
    customers: number;
  };
  monthlyData: MonthlyData[];
  dailyData: { date: string; revenue: number; orders: number }[];
  ordersByStatus: OrderStatus[];
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  recentOrders: any[];
  newCustomers: any[];
  period: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAnalytics(timeRange);
      if (response.data.success) {
        setData(response.data.analytics);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(data?.totalRevenue || 0),
      change: data?.changes?.revenue || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      lightBg: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Orders',
      value: (data?.totalOrders || 0).toLocaleString(),
      change: data?.changes?.orders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Total Customers',
      value: (data?.totalCustomers || 0).toLocaleString(),
      change: data?.changes?.customers || 0,
      icon: Users,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Total Products',
      value: (data?.totalProducts || 0).toLocaleString(),
      change: 0,
      icon: Package,
      color: 'bg-orange-500',
      lightBg: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const secondaryStats = [
    {
      title: 'Avg Order Value',
      value: formatPrice(data?.avgOrderValue || 0),
      icon: TrendingUp
    },
    {
      title: 'Orders/Customer',
      value: data?.conversionRate?.toFixed(1) || '0',
      icon: Activity
    }
  ];

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...(data?.monthlyData?.map(d => d.revenue) || [1]));
  const maxOrders = Math.max(...(data?.monthlyData?.map(d => d.orders) || [1]));

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your store performance and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.lightBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center text-sm font-medium ${
                  stat.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {secondaryStats.map((stat) => (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly revenue for the last 12 months
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data?.monthlyData && data.monthlyData.length > 0 ? (
              data.monthlyData.slice(-6).map((item, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {item.monthShort} {item.year}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.revenue)}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 group-hover:from-primary-600 group-hover:to-primary-700"
                      style={{ 
                        width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Orders Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly orders for the last 12 months
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data?.monthlyData && data.monthlyData.length > 0 ? (
              data.monthlyData.slice(-6).map((item, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {item.monthShort} {item.year}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.orders} orders
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                      style={{ 
                        width: `${maxOrders > 0 ? (item.orders / maxOrders) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <p>No orders data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orders by Status
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          {data?.ordersByStatus && data.ordersByStatus.length > 0 ? (
            <div className="space-y-4">
              {data.ordersByStatus.map((status) => {
                const percentage = data.totalOrders 
                  ? Math.round((status.count / data.totalOrders) * 100) 
                  : 0;
                
                return (
                  <div key={status._id}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status._id)}`} />
                        <span className="capitalize text-gray-700 dark:text-gray-300">
                          {status._id || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {status.count}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getStatusColor(status._id)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <p>No order status data available</p>
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Selling Products
          </h3>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">
                    #{index + 1}
                  </span>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.totalSold} sold • {formatPrice(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <p>No product data available</p>
            </div>
          )}
        </Card>

        {/* Top Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Categories
          </h3>
          {data?.topCategories && data.topCategories.length > 0 ? (
            <div className="space-y-4">
              {data.topCategories.map((category, index) => {
                const totalCategoryRevenue = data.topCategories.reduce((sum, c) => sum + c.totalRevenue, 0);
                const percentage = totalCategoryRevenue > 0 
                  ? Math.round((category.totalRevenue / totalCategoryRevenue) * 100) 
                  : 0;
                
                const categoryColors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500'
                ];
                
                return (
                  <div key={category._id || index}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {category._id || 'Uncategorized'}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(category.totalRevenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${categoryColors[index % categoryColors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <p>No category data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Period Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Period Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Period Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(data?.currentPeriod?.revenue || 0)}
            </p>
            <p className="text-sm text-gray-500">vs {formatPrice(data?.previousPeriod?.revenue || 0)} previous</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Period Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.currentPeriod?.orders || 0}
            </p>
            <p className="text-sm text-gray-500">vs {data?.previousPeriod?.orders || 0} previous</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.currentPeriod?.customers || 0}
            </p>
            <p className="text-sm text-gray-500">vs {data?.previousPeriod?.customers || 0} previous</p>
          </div>
        </div>
      </Card>
    </div>
  );
}