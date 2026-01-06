import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Crop from '../modules/marketplace/marketplace.model';
import Post from '../modules/post/post.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farming-platform';
const USER_NAME = 'test';

const crops = [
  {
    name: 'Organic Rice (অর্গানিক চাল)',
    qty: 120,
    price: 62,
    notes: 'Mokam fresh, min 10kg',
    color: 'amber',
    icon: 'fa-seedling',
    imageUrl: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Deshi Tomato',
    qty: 80,
    price: 110,
    notes: 'Firm, salad-ready',
    color: 'red',
    icon: 'fa-apple-alt',
    imageUrl: 'https://images.unsplash.com/photo-1506801310323-534be5e7f316?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Green Chili (কাঁচা মরিচ)',
    qty: 35,
    price: 160,
    notes: 'Medium jhal, fresh pick',
    color: 'emerald',
    icon: 'fa-pepper-hot',
    imageUrl: 'https://images.unsplash.com/photo-1522184216316-3c79aa1e923c?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Potato (আলু)',
    qty: 200,
    price: 34,
    notes: 'New harvest, paka, clean',
    color: 'yellow',
    icon: 'fa-seedling',
    imageUrl: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Onion (পেঁয়াজ)',
    qty: 90,
    price: 78,
    notes: 'Dry storage, deshi flavour',
    color: 'rose',
    icon: 'fa-circle',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Garlic (রসুন)',
    qty: 60,
    price: 230,
    notes: 'সাদা কোয়া, strong smell',
    color: 'slate',
    icon: 'fa-leaf',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Ginger (আদা)',
    qty: 55,
    price: 260,
    notes: 'Fresh cut, paste-ready',
    color: 'orange',
    icon: 'fa-leaf',
    imageUrl: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Cucumber (শসা)',
    qty: 70,
    price: 85,
    notes: 'Hydro cool, crispy',
    color: 'teal',
    icon: 'fa-lemon',
    imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Cauliflower (ফুলকপি)',
    qty: 50,
    price: 95,
    notes: 'Tight head, white',
    color: 'stone',
    icon: 'fa-seedling',
    imageUrl: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=900&q=70',
  },
  {
    name: 'Spinach (পালং শাক)',
    qty: 40,
    price: 45,
    notes: 'Small leaf, ready to cook',
    color: 'emerald',
    icon: 'fa-leaf',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=70',
  },
];

const makePostText = (crop: typeof crops[number]) => [
  '📢 নতুন বিক্রয় বিজ্ঞপ্তি!',
  `ফসল: ${crop.name}`,
  `পরিমাণ: ${crop.qty} কেজি`,
  `দাম: ৳${crop.price}/কেজি`,
  `যোগাযোগ: 01712345678`,
  crop.notes ? `নোট: ${crop.notes}` : null,
]
  .filter(Boolean)
  .join('\n');

const run = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);

    // Optional: clean previous seeds for this user
    console.log('Cleaning previous test user seeds...');
    await Promise.all([
      Crop.deleteMany({ user: USER_NAME, notes: { $regex: 'test-seed-10', $options: 'i' } }),
      Post.deleteMany({ user: USER_NAME, text: { $regex: '📢 নতুন বিক্রয় বিজ্ঞপ্তি', $options: 'i' } }),
    ]);

    const now = new Date();

    const cropDocs = crops.map((c, idx) => ({
      user: USER_NAME,
      name: c.name,
      qty: c.qty,
      price: c.price,
      icon: c.icon,
      color: c.color,
      contact: '01712345678',
      notes: `${c.notes} | test-seed-10-${idx + 1}`,
      imageUrl: c.imageUrl,
      soldOut: false,
      createdAt: new Date(now.getTime() + idx * 1000),
    }));

    const insertedCrops = await Crop.insertMany(cropDocs);
    console.log(`Inserted ${insertedCrops.length} crops for user "${USER_NAME}".`);

    const posts = insertedCrops.map((crop) => ({
      user: USER_NAME,
      role: 'Farmer',
      initial: 'T',
      color: crop.color || 'green',
      text: makePostText(crop),
      mediaType: crop.imageUrl ? 'image' : null,
      mediaSrc: crop.imageUrl || null,
      marketStatus: crop.soldOut ? 'sold-out' : 'available',
      commentsList: [],
      reactions: [],
      likes: 0,
      shares: 0,
      createdAt: crop.createdAt,
    }));

    const insertedPosts = await Post.insertMany(posts);

    // Link posts back to crops
    const bulk = insertedCrops.map((crop, idx) => ({
      updateOne: {
        filter: { _id: crop._id },
        update: { $set: { communityPostId: insertedPosts[idx]._id as any } },
      },
    }));
    await Crop.bulkWrite(bulk as any);

    console.log(`Inserted ${insertedPosts.length} community posts for user "${USER_NAME}".`);
  } catch (err) {
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

run();
