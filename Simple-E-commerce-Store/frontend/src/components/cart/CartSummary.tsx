'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Tag, X, Loader2 } from 'lucide-react';
import { Cart } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { cartApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartSummaryProps {
  cart: Cart;
  showCheckoutButton?: boolean;
  onCartUpdate?: (cart: Cart) => void;
}

export default function CartSummary({ cart, showCheckoutButton = true, onCartUpdate }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const subtotal = cart.subtotal || 0;
  const discountAmount = cart.coupon?.discountAmount || 0;
  const afterDiscount = subtotal - discountAmount;
  const shipping = afterDiscount > 100 ? 0 : 10;
  const tax = afterDiscount * 0.1;
  const total = afterDiscount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    try {
      const { data } = await cartApi.applyCoupon(couponCode.trim());
      toast.success('Coupon applied successfully!');
      setCouponCode('');
      if (onCartUpdate && data.cart) {
        onCartUpdate(data.cart);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setIsRemoving(true);
    try {
      const { data } = await cartApi.removeCoupon();
      toast.success('Coupon removed');
      if (onCartUpdate && data.cart) {
        onCartUpdate(data.cart);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove coupon');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h2>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
          Promo Code
        </label>
        {cart.coupon ? (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-400">
                {cart.coupon.code}
              </span>
              <span className="text-sm text-green-600 dark:text-green-500">
                (-{formatPrice(discountAmount)})
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={isRemoving}
              className="text-green-600 hover:text-green-800 dark:text-green-400"
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleApplyCoupon}
              disabled={isApplying}
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Summary Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Subtotal ({cart.itemCount} items)
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(subtotal)}
          </span>
        </div>

        {cart.coupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({cart.coupon.code})</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Estimated Tax</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(tax)}
          </span>
        </div>

        {shipping > 0 && !cart.coupon && (
          <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
            <Tag className="w-4 h-4" />
            <span>Add {formatPrice(100 - subtotal)} more for free shipping!</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link href="/checkout" className="block mt-6">
          <Button className="w-full" size="lg">
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      )}

      {/* Continue Shopping */}
      <Link
        href="/products"
        className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
      >
        <ShoppingBag className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  );
}