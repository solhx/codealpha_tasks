'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Pages that should NOT have Header/Footer (admin pages)
  const noLayoutPages = [
    '/admin'
  ];
  
  // Pages that should have Header only (no footer) - auth pages
  const headerOnlyPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];
  
  // Check if current path starts with any of the no-layout paths (admin)
  const shouldHideLayout = noLayoutPages.some(page => pathname?.startsWith(page));
  
  // Check if it's an auth page (header only, no footer)
  const isAuthPage = headerOnlyPages.some(page => pathname?.startsWith(page));

  // Admin pages - no header/footer at all
  if (shouldHideLayout) {
    return <>{children}</>;
  }

  // Auth pages - header only, no footer
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Regular pages - header and footer
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}