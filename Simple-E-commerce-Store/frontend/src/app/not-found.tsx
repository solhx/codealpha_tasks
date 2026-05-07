'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const handleGoBack = () => {
    // Check if we have history to go back to
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      // Determine where to redirect based on context
      if (pathname?.startsWith('/admin')) {
        // If in admin section and user is admin, go to admin dashboard
        if (isAuthenticated && user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
  };

  // Determine the appropriate "home" link based on context
  const getHomeLink = () => {
    if (pathname?.startsWith('/admin') && isAuthenticated && user?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/';
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <span className="text-[150px] font-bold text-gray-100 dark:text-gray-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={getHomeLink()}>
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4 mr-2" />
              {pathname?.startsWith('/admin') ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </Link>
          
          {!pathname?.startsWith('/admin') && (
            <Link href="/products">
              <Button variant="outline" size="lg">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoBack}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}