'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, DollarSign, Calendar, Copy, Check, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api';
import { Coupon } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    minPurchase: '',
    maxUses: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const { data } = await adminApi.getCoupons({ limit: 100 });
      setCoupons(data.coupons || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount: String(coupon.discount),
        discountType: coupon.discountType,
        minPurchase: String(coupon.minPurchase),
        maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
        expiresAt: coupon.expiresAt.split('T')[0],
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discount: '',
        discountType: 'percentage',
        minPurchase: '',
        maxUses: '',
        expiresAt: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.code || !formData.discount || !formData.expiresAt) {
    toast.error('Please fill in required fields');
    return;
  }

  setIsSaving(true);
  try {
    const couponData = {
      code: formData.code.toUpperCase(),
      discount: Number(formData.discount),
      discountType: formData.discountType,
      minPurchase: Number(formData.minPurchase) || 0,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,  // Changed null to undefined
      expiresAt: formData.expiresAt,
    };

    if (editingCoupon) {
      await adminApi.updateCoupon(editingCoupon._id, couponData);
      toast.success('Coupon updated successfully');
    } else {
      await adminApi.createCoupon(couponData);
      toast.success('Coupon created successfully');
    }
    
    handleCloseModal();
    fetchCoupons();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save coupon');
  } finally {
    setIsSaving(false);
  }
};

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await adminApi.deleteCoupon(couponId);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (couponId: string) => {
    try {
      const coupon = coupons.find(c => c._id === couponId);
      await adminApi.updateCoupon(couponId, { isActive: !coupon?.isActive });
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Coupons & Promo Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage discount codes for your store
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coupons.filter(c => isExpired(c.expiresAt)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No coupons yet</p>
              <Button onClick={() => handleOpenModal()} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create your first coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Discount</th>
                    <th className="pb-3 font-medium">Min Purchase</th>
                    <th className="pb-3 font-medium">Usage</th>
                    <th className="pb-3 font-medium">Expires</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="text-sm">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm text-gray-900 dark:text-white">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent className="w-4 h-4" />
                              {coupon.discount}%
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" />
                              {coupon.discount}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        ${coupon.minPurchase}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {coupon.usedCount} / {coupon.maxUses || '∞'}
                      </td>
                      <td className="py-4">
                        <span className={isExpired(coupon.expiresAt) ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}>
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            coupon.isActive && !isExpired(coupon.expiresAt)
                              ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {isExpired(coupon.expiresAt) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(coupon)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER20"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Purchase ($)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Unlimited"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}