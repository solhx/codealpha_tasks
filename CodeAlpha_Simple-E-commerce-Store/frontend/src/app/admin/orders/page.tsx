'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Order } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import OrdersTable from '@/components/admin/OrdersTable';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentOptions = [
  { value: '', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchOrders = useCallback(async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await adminApi.getOrders({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
      });
      
      let filteredOrders = data.orders || [];
      
      // Filter by payment status on client side (or add to backend)
      if (paymentFilter === 'paid') {
        filteredOrders = filteredOrders.filter((o: Order) => o.isPaid);
      } else if (paymentFilter === 'unpaid') {
        filteredOrders = filteredOrders.filter((o: Order) => !o.isPaid);
      }
      
      setOrders(filteredOrders);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.pages || 1,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status, search, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(pagination.currentPage, false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders(pagination.currentPage, false);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentChange = (orderId: string, isPaid: boolean) => {
    // Update local state immediately for better UX
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? { ...order, isPaid, paidAt: isPaid ? new Date().toISOString() : undefined }
          : order
      )
    );
  };

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  // Calculate stats
  const paidOrders = orders.filter(o => o.isPaid).length;
  const unpaidOrders = orders.filter(o => !o.isPaid).length;
  const totalRevenue = orders
    .filter(o => o.isPaid)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid / Unpaid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-green-600">{paidOrders}</span>
                {' / '}
                <span className="text-red-600">{unpaidOrders}</span>
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue (Paid)</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order number..."
                leftIcon={<Search className="w-5 h-5" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                options={paymentOptions}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <span className="text-2xl">💡</span>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Click on the payment status badge (Paid/Unpaid) to toggle the payment status of an order.
        </p>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <OrdersTable 
              orders={orders} 
              onStatusChange={handleStatusChange}
              onPaymentChange={handlePaymentChange}
              onRefresh={handleRefresh}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}