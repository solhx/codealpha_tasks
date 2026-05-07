import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Product from './models/Product.model.js';
import Cart from './models/Cart.model.js';
import Order from './models/Order.model.js';

dotenv.config();

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
    shortDescription: 'Latest flagship smartphone with titanium design',
    price: 1199,
    comparePrice: 1299,
    category: 'electronics',
    brand: 'Apple',
    images: [{ url: '/uploads/iphone15.jpg', alt: 'iPhone 15 Pro Max' }],
    stock: 50,
    featured: true,
    tags: ['smartphone', 'apple', 'premium', '5g'],
    specifications: [
      { key: 'Display', value: '6.7" Super Retina XDR' },
      { key: 'Chip', value: 'A17 Pro' },
      { key: 'Storage', value: '256GB' }
    ]
  },
  {
    name: 'MacBook Pro 16"',
    description: 'Supercharged by M3 Pro or M3 Max, the most powerful MacBook Pro ever.',
    shortDescription: 'Professional laptop with M3 chip',
    price: 2499,
    comparePrice: 2699,
    category: 'electronics',
    brand: 'Apple',
    images: [{ url: '/uploads/macbook.jpg', alt: 'MacBook Pro' }],
    stock: 30,
    featured: true,
    tags: ['laptop', 'apple', 'professional'],
    specifications: [
      { key: 'Display', value: '16.2" Liquid Retina XDR' },
      { key: 'Chip', value: 'Apple M3 Pro' },
      { key: 'Memory', value: '18GB' }
    ]
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation wireless headphones.',
    shortDescription: 'Premium noise-cancelling headphones',
    price: 349,
    comparePrice: 399,
    category: 'electronics',
    brand: 'Sony',
    images: [{ url: '/uploads/sony-headphones.jpg', alt: 'Sony WH-1000XM5' }],
    stock: 100,
    featured: true,
    tags: ['headphones', 'wireless', 'noise-cancelling']
  },
  {
    name: 'Nike Air Max 270',
    description: 'Iconic lifestyle shoe with Max Air unit for all-day comfort.',
    shortDescription: 'Classic lifestyle sneakers',
    price: 150,
    category: 'clothing',
    brand: 'Nike',
    images: [{ url: '/uploads/nike-airmax.jpg', alt: 'Nike Air Max 270' }],
    stock: 200,
    featured: true,
    tags: ['shoes', 'sneakers', 'nike', 'casual']
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'The original blue jean since 1873. Straight leg, button fly.',
    shortDescription: 'Classic straight leg jeans',
    price: 89,
    category: 'clothing',
    brand: 'Levi\'s',
    images: [{ url: '/uploads/levis-501.jpg', alt: 'Levi\'s 501' }],
    stock: 150,
    tags: ['jeans', 'denim', 'classic']
  },
  {
    name: 'Samsung 65" QLED 4K TV',
    description: 'Quantum Dot technology delivers over a billion shades of brilliant color.',
    shortDescription: '65-inch QLED Smart TV',
    price: 1299,
    comparePrice: 1499,
    category: 'electronics',
    brand: 'Samsung',
    images: [{ url: '/uploads/samsung-tv.jpg', alt: 'Samsung QLED TV' }],
    stock: 25,
    featured: true,
    tags: ['tv', 'smart-tv', '4k', 'qled']
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Intelligent cordless vacuum with laser dust detection.',
    shortDescription: 'Cordless vacuum with laser detection',
    price: 749,
    category: 'home',
    brand: 'Dyson',
    images: [{ url: '/uploads/dyson-v15.jpg', alt: 'Dyson V15' }],
    stock: 40,
    tags: ['vacuum', 'cordless', 'home-appliance']
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
    shortDescription: 'Bestselling finance book',
    price: 18,
    category: 'books',
    brand: 'Harriman House',
    images: [{ url: '/uploads/psychology-money.jpg', alt: 'Psychology of Money' }],
    stock: 500,
    tags: ['book', 'finance', 'bestseller']
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Handheld gaming console with vibrant 7-inch OLED screen.',
    shortDescription: 'Portable gaming console',
    price: 349,
    category: 'electronics',
    brand: 'Nintendo',
    images: [{ url: '/uploads/switch-oled.jpg', alt: 'Nintendo Switch' }],
    stock: 75,
    featured: true,
    tags: ['gaming', 'console', 'nintendo', 'portable']
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat. 6mm thickness for comfort.',
    shortDescription: 'Premium non-slip yoga mat',
    price: 49,
    category: 'sports',
    brand: 'Manduka',
    images: [{ url: '/uploads/yoga-mat.jpg', alt: 'Yoga Mat' }],
    stock: 200,
    tags: ['yoga', 'fitness', 'mat']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shophub.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created:', admin.email);

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@shophub.com',
      password: 'user123',
      role: 'user',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    });
    console.log('Test user created:', testUser.email);

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@shophub.com / admin123');
    console.log('User:  user@shophub.com / user123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();