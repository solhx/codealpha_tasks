'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/common/Pagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await productsApi.getAll({
          category,
          search,
          sort,
          minPrice,
          maxPrice,
          page,
          featured: featured === 'true',
          limit: 12,
        });
        setProducts(data.products || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.pages || 1,
          total: data.total || 0,
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sort, minPrice, maxPrice, page, featured]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    window.history.pushState(null, '', `/products?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    window.history.pushState(null, '', `/products?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getPageTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    if (featured === 'true') return 'Featured Products';
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {pagination.total} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
            </Button>

            <div className="w-48">
              <Select
                options={sortOptions}
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Bar (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {products.length} of {pagination.total} products
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <div className="w-48">
                  <Select
                    options={sortOptions}
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 z-50 lg:hidden overflow-y-auto"
              >
                <ProductFilters
                  isMobile
                  onMobileClose={() => setShowMobileFilters(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}