import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Crop from '../modules/marketplace/marketplace.model';
import Post from '../modules/post/post.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farming-platform';

const sampleCrops = [
    { name: 'Organic Rice (অর্গানিক চাল)', notes: 'Minimum 5 kg nite hobe', icon: 'fa-seedling', color: 'yellow' },
    { name: 'Deshi Tomato (দেশি টমেটো)', notes: 'Red & sweet, salaad-ready', icon: 'fa-apple-alt', color: 'red' },
    { name: 'Green Chili (কাঁচা মরিচ)', notes: 'ঝাল medium, fresh pick', icon: 'fa-pepper-hot', color: 'emerald' },
    { name: 'Potato (আলু)', notes: 'Paka new harvest, bulk ok', icon: 'fa-seedling', color: 'amber' },
    { name: 'Onion (পেঁয়াজ)', notes: 'Deshi flavor, dry storage', icon: 'fa-circle', color: 'rose' },
    { name: 'Garlic (রসুন)', notes: 'Strong smell, সাদা কোয়া', icon: 'fa-leaf', color: 'slate' },
    { name: 'Ginger (আদা)', notes: 'Fresh cut, ready for paste', icon: 'fa-leaf', color: 'orange' },
    { name: 'Mustard Oil (সরিষার তেল)', notes: 'Ghanni pressed, no mix', icon: 'fa-oil-can', color: 'amber' },
    { name: 'Raw Honey (প্রাকৃতিক মধু)', notes: 'Sundarbans style, unfiltered', icon: 'fa-water', color: 'yellow' },
    { name: 'Mango Langra (ল্যাংড়া আম)', notes: 'মৌসুমি স্বাদ, preorder ok', icon: 'fa-lemon', color: 'lime' },
    { name: 'Banana Sagor (কলা)', notes: 'Sweet & soft, 12 pc guchchho', icon: 'fa-seedling', color: 'green' },
    { name: 'Papaya (পেঁপে)', notes: 'Paka ready-to-eat', icon: 'fa-seedling', color: 'lime' },
    { name: 'Spinach (পালং শাক)', notes: 'Chhoto পাতায়, wash & cook', icon: 'fa-leaf', color: 'emerald' },
    { name: 'Cucumber (শসা)', notes: 'Hydro cool, salad best', icon: 'fa-lemon', color: 'teal' },
    { name: 'Pumpkin (কুমড়া)', notes: 'Misti ফ্লেভার, soup-ready', icon: 'fa-seedling', color: 'orange' },
    { name: 'Cauliflower (ফুলকপি)', notes: 'White tight head', icon: 'fa-seedling', color: 'stone' },
    { name: 'Broccoli', notes: 'Green tight curd', icon: 'fa-seedling', color: 'emerald' },
    { name: 'Okra (ঢেঁড়স)', notes: 'Tender soft, কম আঁশ', icon: 'fa-leaf', color: 'green' },
    { name: 'Eggplant (বেগুন)', notes: 'Jali begun mix sizes', icon: 'fa-leaf', color: 'purple' },
    { name: 'Lemon (লেবু)', notes: 'Pati & এলাচি mix pack', icon: 'fa-lemon', color: 'yellow' },
    { name: 'Watermelon (তরমুজ)', notes: 'Sweet red flesh', icon: 'fa-seedling', color: 'red' },
    { name: 'Pineapple (আনারস)', notes: 'Honey queen', icon: 'fa-lemon', color: 'amber' },
    { name: 'Guava (পেয়ারা)', notes: 'Thai crunchy', icon: 'fa-seedling', color: 'green' },
    { name: 'Milk (দুধ)', notes: 'Fresh cow milk, chilled', icon: 'fa-cow', color: 'sky' },
    { name: 'Deshi Egg (দেশি ডিম)', notes: 'Free range, brown shell', icon: 'fa-egg', color: 'amber' },
    { name: 'Tilapia Fish (তেলাপিয়া)', notes: 'Ice pack, cleaned', icon: 'fa-fish', color: 'blue' },
    { name: 'Rohu Fish (রুই)', notes: '1.2-1.5kg avg', icon: 'fa-fish', color: 'cyan' },
    { name: 'Pabda Fish (পাবদা)', notes: 'Soft & boneless feel', icon: 'fa-fish', color: 'teal' },
    { name: 'Prawn (চিংড়ি)', notes: 'Bagda medium size', icon: 'fa-fish', color: 'rose' },
    { name: 'Beef Halal (গরুর মাংস)', notes: 'Preorder, chilled cut', icon: 'fa-drumstick-bite', color: 'stone' },
    { name: 'Mutton (খাসির মাংস)', notes: 'Lean, soft', icon: 'fa-drumstick-bite', color: 'gray' },
    { name: 'Chicken Broiler', notes: 'Soft skin, cleaned', icon: 'fa-drumstick-bite', color: 'orange' },
    { name: 'Chicken Deshi (দেশি মুরগি)', notes: 'Pre-order 24h', icon: 'fa-drumstick-bite', color: 'amber' },
    { name: 'Coconut (নারিকেল)', notes: 'Paka daana, water sweet', icon: 'fa-circle', color: 'teal' },
    { name: 'Coriander Leaf (ধনেপাতা)', notes: 'Fragrant, ready garnish', icon: 'fa-leaf', color: 'emerald' },
    { name: 'Mint Leaf (পুদিনা)', notes: 'Cool & fresh', icon: 'fa-leaf', color: 'green' },
    { name: 'Turmeric Powder (হলুদ গুঁড়া)', notes: 'Sun dried, no color mix', icon: 'fa-utensils', color: 'yellow' },
    { name: 'Red Chili Powder (মরিচ গুঁড়া)', notes: 'Spicy but bright', icon: 'fa-pepper-hot', color: 'rose' },
    { name: 'Pulse Lentil (মসুর ডাল)', notes: 'Clean sorted', icon: 'fa-bread-slice', color: 'amber' },
    { name: 'Chickpea (ছোলা)', notes: 'Roast ready', icon: 'fa-bread-slice', color: 'yellow' },
    { name: 'Wheat Flour (আটা)', notes: 'Chakki fresh', icon: 'fa-bread-slice', color: 'stone' },
    { name: 'Brown Sugar (গুড়)', notes: 'Date palm gur patali', icon: 'fa-cube', color: 'amber' },
    { name: 'Molasses Liquid (খেজুরের রস)', notes: 'Winter batch, glass bottle', icon: 'fa-water', color: 'amber' },
    { name: 'Sunflower Oil', notes: 'Light taste', icon: 'fa-oil-can', color: 'yellow' },
    { name: 'Tea Leaf (চা পাতা)', notes: 'Assam mix, strong', icon: 'fa-mug-hot', color: 'green' },
    { name: 'Coffee Bean', notes: 'Medium roast, drip ok', icon: 'fa-mug-hot', color: 'stone' },
    { name: 'Cattle Feed (গরুর খাবার)', notes: 'Balanced protein', icon: 'fa-cow', color: 'orange' },
    { name: 'Duck Egg (হাঁসের ডিম)', notes: 'Rich yolk', icon: 'fa-egg', color: 'blue' }
];

const imagePool = [
    'https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1506801310323-534be5e7f316?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1522184216316-3c79aa1e923c?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=60'
];

const pickFrom = <T,>(items: T[], index: number): T => items[index % items.length];

const buildCrops = (count: number) => {
    return Array.from({ length: count }).map((_, idx) => {
        const base = pickFrom(sampleCrops, idx);
        const qty = 20 + ((idx * 3) % 90); // 20-109 kg/pcs
        const price = 35 + ((idx * 7) % 90); // 35-124 per unit
        const contactNumber = `017${(1234560 + idx).toString().padStart(7, '0')}`;

        return {
            user: `seed-farmer-${String(idx + 1).padStart(2, '0')}`,
            name: base.name,
            qty,
            price,
            icon: base.icon,
            color: base.color,
            contact: contactNumber,
            notes: `${base.notes} | batch-${idx + 1}`,
            imageUrl: pickFrom(imagePool, idx),
            soldOut: idx % 7 === 0 // mix availability
        };
    });
};

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected. Clearing previous seed data (seed-farmer-xx users)...');
        await Promise.all([
            Crop.deleteMany({ user: { $regex: /^seed-farmer-/ } }),
            Post.deleteMany({ user: { $regex: /^seed-farmer-/ } })
        ]);

        const crops = buildCrops(50);
        const insertedCrops = await Crop.insertMany(crops);
        console.log(`Inserted ${insertedCrops.length} marketplace crops.`);

        // Auto-share to community feed
        const postsPayload = insertedCrops.map((crop) => {
            const sellerName = crop.user;
            const initials = sellerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

            const postText = [
                '📢 নতুন বিক্রয় বিজ্ঞপ্তি!',
                `ফসল: ${crop.name}`,
                `পরিমাণ: ${crop.qty} কেজি` ,
                `দাম: ৳${crop.price}/কেজি`,
                `যোগাযোগ: ${crop.contact}`,
                crop.notes ? `নোট: ${crop.notes}` : null
            ]
                .filter(Boolean)
                .join('\n');

            return {
                user: sellerName,
                role: 'Farmer',
                initial: initials,
                color: crop.color || 'green',
                text: postText,
                mediaType: crop.imageUrl ? 'image' : null,
                mediaSrc: crop.imageUrl || null,
                marketStatus: crop.soldOut ? 'sold-out' : 'available',
                commentsList: [],
                reactions: [],
                likes: 0,
                shares: 0,
                createdAt: crop.createdAt
            };
        });

        const insertedPosts = await Post.insertMany(postsPayload);
        // Link posts back to crops
        const bulk = insertedCrops.map((crop, idx) => ({
            updateOne: {
                filter: { _id: crop._id },
                update: { $set: { communityPostId: insertedPosts[idx]._id as any } }
            }
        }));
        await Crop.bulkWrite(bulk as any);

        console.log(`Also inserted ${insertedPosts.length} community posts from seeds.`);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

seed();
