'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { CreditCard, Wallet, Truck } from 'lucide-react';
import { CheckoutFormData } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
}

const paymentMethods = [
  {
    value: 'credit_card',
    label: 'Credit Card',
    description: 'Pay securely with your credit card',
    icon: CreditCard,
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Fast and secure payment with PayPal',
    icon: Wallet,
  },
  {
    value: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Truck,
  },
];

export default function PaymentForm({ register, errors, watch }: PaymentFormProps) {
  const selectedMethod = watch('paymentMethod');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <CreditCard className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payment Method
        </h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.value}
            className={cn(
              'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              selectedMethod === method.value
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <input
              type="radio"
              value={method.value}
              {...register('paymentMethod')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <method.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {method.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
            </div>
          </label>
        ))}
      </div>

      {errors.paymentMethod && (
        <p className="text-red-500 text-sm mt-2">{errors.paymentMethod.message}</p>
      )}

      {/* Credit Card Details (shown when credit_card is selected) */}
      {selectedMethod === 'credit_card' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Credit card payment integration would go here.
            <br />
            (Stripe, PayPal, etc.)
          </p>
        </div>
      )}

      {/* Order Notes */}
      <div className="mt-6">
        <label className="label">Order Notes (Optional)</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Any special instructions for your order..."
          className="input resize-none"
        />
      </div>
    </div>
  );
}