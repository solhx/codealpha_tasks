import React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  comparePrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  className?: string;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export default function PriceDisplay({
  price,
  comparePrice,
  size = 'md',
  showDiscount = true,
  className,
}: PriceDisplayProps) {
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? calculateDiscount(comparePrice!, price) : 0;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-bold text-gray-900 dark:text-white',
          sizes[size]
        )}
      >
        {formatPrice(price)}
      </span>

      {hasDiscount && (
        <>
          <span
            className={cn(
              'text-gray-400 line-through',
              size === 'xl' ? 'text-lg' : 'text-sm'
            )}
          >
            {formatPrice(comparePrice!)}
          </span>

          {showDiscount && (
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </div>
  );
}