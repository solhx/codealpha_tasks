'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, ThumbsUp, Flag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Review } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import { reviewSchema, ReviewFormData } from '@/lib/validations';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Rating from '@/components/common/Rating';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  rating: number;
  numReviews: number;
  onReviewAdded?: () => void;
}

export default function ProductReviews({
  productId,
  reviews,
  rating,
  numReviews,
  onReviewAdded,
}: ProductReviewsProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const hasUserReviewed = reviews.some(
    (review) => 
      (typeof review.user === 'string' ? review.user : review.user._id) === user?._id
  );

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    percentage: numReviews > 0 
      ? (reviews.filter((r) => Math.round(r.rating) === star).length / numReviews) * 100 
      : 0,
  }));

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    setIsSubmitting(true);
    try {
      await productsApi.addReview(productId, {
        rating: selectedRating,
        comment: data.comment,
      });
      toast.success('Review submitted successfully!');
      reset();
      setShowReviewForm(false);
      setSelectedRating(5);
      onReviewAdded?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Customer Reviews
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {rating.toFixed(1)}
              </div>
              <Rating value={rating} size="lg" readonly />
              <p className="text-gray-500 mt-2">
                Based on {numReviews} {numReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {star} ★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>

            {/* Write Review Button */}
            {isAuthenticated && !hasUserReviewed && (
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full mt-6"
                variant={showReviewForm ? 'outline' : 'primary'}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            )}

            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-500 mt-6">
                Please{' '}
                <a href="/login" className="text-primary-600 hover:underline">
                  login
                </a>{' '}
                to write a review
              </p>
            )}

            {hasUserReviewed && (
              <p className="text-center text-sm text-green-600 mt-6">
                ✓ You've already reviewed this product
              </p>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Write Your Review
                  </h3>

                  {/* Rating Selection */}
                  <div className="mb-4">
                    <label className="label">Your Rating</label>
                    <Rating
                      value={selectedRating}
                      onChange={setSelectedRating}
                      readonly={false}
                      size="lg"
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="label">Your Review</label>
                    <textarea
                      {...register('comment')}
                      rows={4}
                      placeholder="Share your experience with this product..."
                      className="input resize-none"
                    />
                    {errors.comment && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.comment.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" isLoading={isSubmitting}>
                    Submit Review
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-medium">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Rating value={review.rating} size="sm" readonly />
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}