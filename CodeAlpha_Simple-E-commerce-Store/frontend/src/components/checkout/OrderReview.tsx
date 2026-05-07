'use client';

import React from 'react';
import Image from 'next/image';
import { Package, MapPin, CreditCard, FileText, Tag } from 'lucide-react';
import { Cart } from '@/types';
import { CheckoutFormData } from '@/lib/validations';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface OrderReviewProps {
  cart: Cart;
  formData: CheckoutFormData;
}

export default function OrderReview({ cart, formData }: OrderReviewProps) {
  const subtotal = cart.subtotal || 0;
  const discountAmount = cart.coupon?.discountAmount || 0;
  const afterDiscount = subtotal - discountAmount;
  const shipping = afterDiscount > 100 ? 0 : 10;
  const tax = afterDiscount * 0.1;
  const total = afterDiscount + shipping + tax;

  const paymentMethodLabels: Record<string, string> = {
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    cash_on_delivery: 'Cash on Delivery',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <FileText className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Review
        </h2>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
          <Package className="w-4 h-4" />
          Items ({cart.itemCount})
        </h3>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item._id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(item.product.images[0]?.url)}
                  alt={item.product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
          <MapPin className="w-4 h-4" />
          Shipping Address
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white">{formData.fullName}</p>
          <p>{formData.street}</p>
          <p>
            {formData.city}, {formData.state} {formData.zipCode}
          </p>
          <p>{formData.country}</p>
          <p className="mt-1">{formData.phone}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
          <CreditCard className="w-4 h-4" />
          Payment Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {paymentMethodLabels[formData.paymentMethod]}
        </p>
      </div>

      {/* Order Notes */}
      {formData.notes && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Order Notes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formData.notes}</p>
        </div>
      )}

      {/* Price Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
        </div>
        
        {cart.coupon && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Discount ({cart.coupon.code})
            </span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="text-gray-900 dark:text-white">
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="text-gray-900 dark:text-white">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}