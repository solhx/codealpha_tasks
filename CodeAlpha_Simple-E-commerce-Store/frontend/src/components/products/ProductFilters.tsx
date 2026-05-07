'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FilterSection {
  title: string;
  isOpen: boolean;
  toggle: () => void;
  children: React.ReactNode;
}

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'books', label: 'Books' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'toys', label: 'Toys' },
];

const priceRanges = [
  { value: '0-25', label: 'Under \$25' },
  { value: '25-50', label: '\$25 - \$50' },
  { value: '50-100', label: '\$50 - \$100' },
  { value: '100-200', label: '\$100 - \$200' },
  { value: '200-500', label: '\$200 - \$500' },
  { value: '500-', label: 'Over \$500' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name: A-Z' },
];

interface ProductFiltersProps {
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export default function ProductFilters({ onMobileClose, isMobile = false }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: false,
  });

  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentRating = searchParams.get('rating') || '';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
    onMobileClose?.();
  };

  const handlePriceRange = (range: string) => {
    const [min, max] = range.split('-');
    const params = new URLSearchParams(searchParams.toString());
    
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const getCurrentPriceRange = () => {
    if (currentMinPrice && currentMaxPrice) {
      return `${currentMinPrice}-${currentMaxPrice}`;
    }
    if (currentMinPrice) {
      return `${currentMinPrice}-`;
    }
    if (currentMaxPrice) {
      return `0-${currentMaxPrice}`;
    }
    return '';
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentRating;

  const FilterSectionComponent = ({ title, isOpen, toggle, children }: FilterSection) => (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl',
      isMobile ? 'p-4' : 'p-6 border border-gray-200 dark:border-gray-700'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
        </div>
        {isMobile && (
          <button onClick={onMobileClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary-600 hover:underline mb-4"
        >
          Clear all filters
        </button>
      )}

      {/* Sort (Mobile) */}
      {isMobile && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="input"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categories */}
      <FilterSectionComponent
        title="Categories"
        isOpen={openSections.categories}
        toggle={() => toggleSection('categories')}
      >
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={currentCategory === category.value}
                onChange={() => updateFilters('category', 
                  currentCategory === category.value ? '' : category.value
                )}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary-600">
                {category.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSectionComponent>

      {/* Price Range */}
      <FilterSectionComponent
        title="Price Range"
        isOpen={openSections.price}
        toggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={getCurrentPriceRange() === range.value}
                onChange={() => handlePriceRange(
                  getCurrentPriceRange() === range.value ? '' : range.value
                )}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary-600">
                {range.label}
              </span>
            </label>
          ))}
        </div>

        {/* Custom Price Range */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilters('minPrice', e.target.value)}
            className="input py-2 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="input py-2 text-sm"
          />
        </div>
      </FilterSectionComponent>

      {/* Rating */}
      <FilterSectionComponent
        title="Rating"
        isOpen={openSections.rating}
        toggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="rating"
                checked={currentRating === String(rating)}
                onChange={() => updateFilters('rating',
                  currentRating === String(rating) ? '' : String(rating)
                )}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-gray-500 text-sm ml-1">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSectionComponent>

      {/* Mobile Apply Button */}
      {isMobile && (
        <Button
          onClick={onMobileClose}
          className="w-full mt-6"
        >
          Apply Filters
        </Button>
      )}
    </div>
  );
}