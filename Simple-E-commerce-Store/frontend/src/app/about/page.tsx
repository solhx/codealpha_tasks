import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  Truck, 
  Shield, 
  HeadphonesIcon,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const stats = [
  { label: 'Happy Customers', value: '50K+' },
  { label: 'Products', value: '10K+' },
  { label: 'Categories', value: '100+' },
  { label: 'Team Members', value: '50+' },
];

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'We put our customers at the heart of everything we do.',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every product is carefully vetted for quality and authenticity.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping to your doorstep.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our support team is always here to help you.',
  },
];

const team = [
  { name: 'John Smith', role: 'CEO & Founder', image: '/images/team/john.jpg' },
  { name: 'Sarah Johnson', role: 'Head of Operations', image: '/images/team/sarah.jpg' },
  { name: 'Mike Chen', role: 'Tech Lead', image: '/images/team/mike.jpg' },
  { name: 'Emily Davis', role: 'Head of Marketing', image: '/images/team/emily.jpg' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-purple-700 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About ShopHub
            </h1>
            <p className="text-xl text-white/80">
              We're on a mission to make quality products accessible to everyone. 
              Since 2020, we've been helping millions of customers find exactly what they need.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 -mt-10 relative z-10">
        <div className="container">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  ShopHub was founded in 2020 with a simple idea: make online shopping 
                  easy, enjoyable, and accessible to everyone. What started as a small 
                  team with big dreams has grown into one of the most trusted e-commerce 
                  platforms.
                </p>
                <p>
                  We believe that everyone deserves access to quality products at fair 
                  prices. That's why we work directly with manufacturers and brands to 
                  bring you the best selection without the markup.
                </p>
                <p>
                  Today, we serve millions of customers worldwide, but our commitment 
                  remains the same: putting our customers first, always.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <Link href="/products">
                  <Button>
                    Start Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🛍️
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-600 rounded-2xl flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold">4+</div>
                  <div className="text-sm">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              These core values guide everything we do and help us deliver the best 
              experience for our customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The passionate people behind ShopHub who work tirelessly to bring you 
              the best shopping experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  👤
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust ShopHub for their shopping needs.
          </p>
          <Link href="/products">
            <Button className="bg-white text-primary-600 hover:bg-gray-100" size="lg">
              Browse Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}