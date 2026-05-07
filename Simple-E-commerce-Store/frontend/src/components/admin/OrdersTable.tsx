'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, DollarSign, MoreVertical } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: string) => void;
  onPaymentChange?: (orderId: string, isPaid: boolean) => void;
  onRefresh?: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Status color helper with proper dark mode support
const getStatusStyles = (status: string): string => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border border-green-300 dark:border-green-500/30',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30',
  };
  return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
};

const getPaymentStyles = (isPaid: boolean): string => {
  return isPaid
    ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border border-green-300 dark:border-green-500/30'
    : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30';
};

export default function OrdersTable({ orders, onStatusChange, onPaymentChange, onRefresh }: OrdersTableProps) {
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  const handlePaymentToggle = async (orderId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'mark as paid' : 'mark as unpaid';
    
    if (!confirm(`Are you sure you want to ${action} this order?`)) {
      return;
    }

    setUpdatingPayment(orderId);
    try {
      await adminApi.updateOrderPayment(orderId, newStatus);
      toast.success(`Order ${newStatus ? 'marked as paid' : 'marked as unpaid'}`);
      
      // Call the callback if provided
      if (onPaymentChange) {
        onPaymentChange(orderId, newStatus);
      }
      
      // Refresh the orders list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingPayment(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 font-medium">Order ID</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Items</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Payment</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr key={order._id} className="text-sm">
              <td className="py-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.orderNumber}
                </span>
              </td>
              <td className="py-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {typeof order.user === 'object' ? order.user.name : 'N/A'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {typeof order.user === 'object' ? order.user.email : ''}
                  </p>
                </div>
              </td>
              <td className="py-4 text-gray-600 dark:text-gray-300">
                {order.items?.length || 0} items
              </td>
              <td className="py-4 font-medium text-gray-900 dark:text-white">
                {formatPrice(order.totalPrice)}
              </td>
              <td className="py-4 text-gray-600 dark:text-gray-300">
                {formatDate(order.createdAt)}
              </td>
              <td className="py-4">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusStyles(order.status)}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-4">
                <button
                  onClick={() => handlePaymentToggle(order._id, order.isPaid)}
                  disabled={updatingPayment === order._id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${getPaymentStyles(order.isPaid)}`}
                  title={order.isPaid ? 'Click to mark as unpaid' : 'Click to mark as paid'}
                >
                  {updatingPayment === order._id ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <DollarSign className="w-3 h-3" />
                  )}
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </button>
              </td>
              <td className="py-4">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 inline-flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="View Order"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}