import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', redirectIfFound = false } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !redirectIfFound) {
      router.push(redirectTo);
    }

    if (isAuthenticated && redirectIfFound) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectIfFound, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}

// Hook to require authentication
export function useRequireAuth(redirectTo: string = '/login') {
  return useAuth({ redirectTo, redirectIfFound: false });
}

// Hook to require admin role
export function useRequireAdmin(redirectTo: string = '/') {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
  };
}