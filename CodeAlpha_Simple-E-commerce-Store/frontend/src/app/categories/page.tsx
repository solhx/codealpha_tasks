import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, laptops, gadgets, and more',
    icon: '🔌',
    color: 'from-blue-500 to-blue-600',
    itemCount: 250,
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion for men, women, and kids',
    icon: '👕',
    color: 'from-pink-500 to-pink-600',
    itemCount: 500,
  },
  {
    name: 'Home & Garden',
    slug: 'home',
    description: 'Furniture, decor, and outdoor essentials',
    icon: '🏠',
    color: 'from-green-500 to-green-600',
    itemCount: 300,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Fiction, non-fiction, and educational',
    icon: '📚',
    color: 'from-yellow-500 to-yellow-600',
    itemCount: 1000,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Equipment, apparel, and accessories',
    icon: '⚽',
    color: 'from-orange-500 to-orange-600',
    itemCount: 200,
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup, and fragrances',
    icon: '💄',
    color: 'from-purple-500 to-purple-600',
    itemCount: 350,
  },
  {
    name: 'Toys',
    slug: 'toys',
    description: 'Games, puzzles, and kids entertainment',
    icon: '🧸',
    color: 'from-red-500 to-red-600',
    itemCount: 150,
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Everything else you might need',
    icon: '📦',
    color: 'from-gray-500 to-gray-600',
    itemCount: 100,
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our wide selection of categories to find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${category.color} p-8 text-white text-center`}>
                  <span className="text-6xl">{category.icon}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {category.description}
                  </p>
                  <span className="text-xs text-primary-600 font-medium">
                    {category.itemCount}+ Products
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Our product catalog is constantly growing. Check out all our products 
            or contact us for special requests.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View All Products
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}