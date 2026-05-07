import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function Logo({ 
  variant = 'default', 
  size = 'md',
  showIcon = true 
}: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div
          className={cn(
            'p-1.5 rounded-lg',
            variant === 'light' ? 'bg-white/20' : 'bg-primary-600'
          )}
        >
          <ShoppingBag
            className={cn(
              iconSizes[size],
              variant === 'light' ? 'text-white' : 'text-white'
            )}
          />
        </div>
      )}
      <span
        className={cn(
          'font-bold',
          sizes[size],
          variant === 'light' ? 'text-white' : 'text-gray-900 dark:text-white'
        )}
      >
        Go<span className="text-primary-600">Buy</span>
      </span>
    </div>
  );
}