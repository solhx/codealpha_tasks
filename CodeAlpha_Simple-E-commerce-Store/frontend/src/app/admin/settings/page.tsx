'use client';

import React, { useState } from 'react';
import { Save, Store, Mail, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
];

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
];

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'ShopHub',
    storeEmail: 'support@shophub.com',
    storePhone: '+1 (234) 567-890',
    storeAddress: '123 Commerce St, New York, NY 10001',
    currency: 'USD',
    timezone: 'America/New_York',
    taxRate: '10',
    freeShippingThreshold: '100',
    orderNotifications: true,
    stockAlerts: true,
    marketingEmails: false,
  });

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your store settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Store Name"
              value={settings.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
            />
            <Input
              label="Store Email"
              type="email"
              value={settings.storeEmail}
              onChange={(e) => handleChange('storeEmail', e.target.value)}
            />
            <Input
              label="Store Phone"
              value={settings.storePhone}
              onChange={(e) => handleChange('storePhone', e.target.value)}
            />
            <div>
              <label className="label">Store Address</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleChange('storeAddress', e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Regional Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Currency"
              options={currencyOptions}
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            />
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', e.target.value)}
            />
            <Input
              label="Free Shipping Threshold ($)"
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
              hint="Orders above this amount get free shipping"
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Order Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Receive email for new orders
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.orderNotifications}
                onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Low Stock Alerts
                </p>
                <p className="text-sm text-gray-500">
                  Get notified when stock is low
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.stockAlerts}
                onChange={(e) => handleChange('stockAlerts', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Marketing Emails
                </p>
                <p className="text-sm text-gray-500">
                  Receive tips and product updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={(e) => handleChange('marketingEmails', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Password
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Last changed 30 days ago
              </p>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Active Sessions
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                You have 2 active sessions
              </p>
              <Button variant="outline" size="sm">
                View Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-200">
                Delete Store Data
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete all store data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger">Delete All Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}