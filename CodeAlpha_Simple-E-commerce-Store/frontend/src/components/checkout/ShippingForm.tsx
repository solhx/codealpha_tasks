'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CheckoutFormData } from '@/lib/validations';

interface ShippingFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

export default function ShippingForm({ register, errors }: ShippingFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <MapPin className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Shipping Address
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            placeholder="John Doe"
            {...register('fullName')}
            error={errors.fullName?.message}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
            error={errors.phone?.message}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Street Address"
            placeholder="123 Main Street, Apt 4B"
            {...register('street')}
            error={errors.street?.message}
            required
          />
        </div>

        <Input
          label="City"
          placeholder="New York"
          {...register('city')}
          error={errors.city?.message}
          required
        />

        <Input
          label="State / Province"
          placeholder="NY"
          {...register('state')}
          error={errors.state?.message}
          required
        />

        <Input
          label="ZIP / Postal Code"
          placeholder="10001"
          {...register('zipCode')}
          error={errors.zipCode?.message}
          required
        />

        <Select
          label="Country"
          options={countries}
          placeholder="Select country"
          {...register('country')}
          error={errors.country?.message}
          required
        />
      </div>
    </div>
  );
}