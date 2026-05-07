// Note: We're using react-hot-toast, but here's a wrapper for consistency
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Toast Functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    });
  },
  warning: (message: string) => {
    toast(message, {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    });
  },
  info: (message: string) => {
    toast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
    });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

// Custom Toaster Component
export const Toaster = () => {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: {
          style: {
            background: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
          },
        },
      }}
    />
  );
};

export default showToast;