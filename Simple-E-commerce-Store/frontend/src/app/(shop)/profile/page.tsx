'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Package, Heart, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { profileSchema, updatePasswordSchema, ProfileFormData } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  useRequireAuth();

  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'address'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      },
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  const quickLinks = [
    { href: '/orders', label: 'My Orders', icon: Package, color: 'bg-blue-500' },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, color: 'bg-red-500' },
    { href: '/profile', label: 'Settings', icon: Settings, color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Card */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-medium rounded-full capitalize">
                  {user?.role}
                </span>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`p-2 ${link.color} text-white rounded-lg`}>
                        <link.icon className="w-4 h-4" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          leftIcon={<User className="w-5 h-5" />}
                          {...registerProfile('name')}
                          error={profileErrors.name?.message}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          leftIcon={<Mail className="w-5 h-5" />}
                          {...registerProfile('email')}
                          error={profileErrors.email?.message}
                          disabled
                          hint="Email cannot be changed"
                        />
                      </div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        leftIcon={<Phone className="w-5 h-5" />}
                        placeholder="+1 (555) 000-0000"
                        {...registerProfile('phone')}
                        error={profileErrors.phone?.message}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                      <Input
                        label="Street Address"
                        placeholder="123 Main Street, Apt 4B"
                        {...registerProfile('address.street')}
                        error={profileErrors.address?.street?.message}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          placeholder="New York"
                          {...registerProfile('address.city')}
                          error={profileErrors.address?.city?.message}
                        />
                        <Input
                          label="State / Province"
                          placeholder="NY"
                          {...registerProfile('address.state')}
                          error={profileErrors.address?.state?.message}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="ZIP / Postal Code"
                          placeholder="10001"
                          {...registerProfile('address.zipCode')}
                          error={profileErrors.address?.zipCode?.message}
                        />
                        <Input
                          label="Country"
                          placeholder="United States"
                          {...registerProfile('address.country')}
                          error={profileErrors.address?.country?.message}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        {...registerPassword('currentPassword')}
                        error={passwordErrors.currentPassword?.message}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        {...registerPassword('newPassword')}
                        error={passwordErrors.newPassword?.message}
                        hint="Must be at least 6 characters"
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        {...registerPassword('confirmPassword')}
                        error={passwordErrors.confirmPassword?.message}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}