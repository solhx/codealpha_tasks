import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, PaginatedResponse } from '@/types';
import { productsApi } from '@/lib/api';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  refetch: () => Promise<void>;
}

export function useProducts(filters: ProductFilters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await productsApi.getAll(filters);
      setProducts(data.products || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.pages || 1,
        total: data.total || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
}

// Hook for single product
export function useProduct(slugOrId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try slug first, then ID
        const { data } = slugOrId.length === 24
          ? await productsApi.getOne(slugOrId)
          : await productsApi.getBySlug(slugOrId);
        setProduct(data.product);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      fetchProduct();
    }
  }, [slugOrId]);

  return { product, loading, error };
}