'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ArrowLeft,
  Download,
  HelpCircle,
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { useRequireAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

const statusSteps = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailPage() {
  useRequireAuth();
  
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersApi.getOne(orderId);
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await ordersApi.cancel(order._id);
      toast.success('Order cancelled successfully');
      // Refresh order
      const { data } = await ordersApi.getOne(orderId);
      setOrder(data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusStep = () => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.status === order.status);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep();
  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order {order.orderNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex gap-3">
            {canCancel && (
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                isLoading={cancelling}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <Button variant="outline">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            {order.status !== 'cancelled' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
                  Order Status
                </h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      const Icon = step.icon;

                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-green-200 dark:ring-green-900' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`mt-2 text-sm font-medium ${
                              isCompleted
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <h2 className="font-semibold text-red-700 dark:text-red-400">
                      Order Cancelled
                    </h2>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      This order has been cancelled
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Order Items ({order.items.length})
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h2>
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(order.itemsPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(order.taxPrice)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Payment Method
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 capitalize">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </p>
                <div className="mt-2">
                  <Badge variant={order.isPaid ? 'success' : 'warning'}>
                    {order.isPaid ? 'Paid' : 'Pending Payment'}
                  </Badge>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Order Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}