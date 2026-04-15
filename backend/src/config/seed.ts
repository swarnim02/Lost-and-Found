import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import db from './database';
import { CategoryModel, ClaimModel, ItemModel, NotificationModel, UserModel } from './schema';

/**
 * Seeds initial categories, a default admin account, and demo users, items,
 * and claims so the app has realistic data to browse on first run.
 *
 * Run with: npm run seed
 */
export async function seed(): Promise<void> {
  await db.connect();

  const categories: { name: string; description: string }[] = [
    { name: 'Electronics', description: 'Phones, laptops, chargers, headphones' },
    { name: 'Documents', description: 'ID cards, passports, certificates' },
    { name: 'Accessories', description: 'Wallets, watches, jewelry, bags' },
    { name: 'Keys', description: 'House, car, office keys' },
    { name: 'Clothing', description: 'Jackets, shoes, hats, scarves' },
    { name: 'Books', description: 'Textbooks, notebooks, novels' },
    { name: 'Other', description: 'Anything not covered above' }
  ];

  for (const cat of categories) {
    await CategoryModel.updateOne(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);

  async function upsertUser(email: string, data: { name: string; password: string; phone?: string; role?: 'user' | 'admin' }): Promise<Types.ObjectId> {
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) return existing._id;
    const hash = await bcrypt.hash(data.password, rounds);
    const user = await UserModel.create({
      name: data.name,
      email,
      password: hash,
      phone: data.phone ?? null,
      role: data.role ?? 'user'
    });
    return user._id;
  }

  const adminId = await upsertUser('admin@lostfound.local', { name: 'Administrator', password: 'admin123', phone: '0000000000', role: 'admin' });
  const aliceId = await upsertUser('alice@campus.edu', { name: 'Alice Verma', password: 'password123', phone: '9876543210' });
  const bobId = await upsertUser('bob@campus.edu', { name: 'Bob Nair', password: 'password123', phone: '9812345670' });
  const chitraId = await upsertUser('chitra@campus.edu', { name: 'Chitra Rao', password: 'password123', phone: '9900112233' });
  const devId = await upsertUser('dev@campus.edu', { name: 'Dev Kapoor', password: 'password123', phone: '9001122334' });
  const eshaId = await upsertUser('esha@campus.edu', { name: 'Esha Patel', password: 'password123' });
  void adminId;

  const catByName = new Map<string, Types.ObjectId>();
  const cats = await CategoryModel.find().lean();
  for (const c of cats) catByName.set(c.name, c._id);

  const today = new Date();
  const iso = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  type DemoItem = {
    title: string;
    description: string;
    category: string;
    location: string;
    daysAgo: number;
    imageUrl?: string | null;
    type: 'lost' | 'found';
    status?: 'open' | 'claimed' | 'returned' | 'closed';
    rewardAmount?: number;
    rewardStatus?: 'not_declared' | 'pending' | 'completed';
    createdBy: Types.ObjectId;
  };

  const demoItems: DemoItem[] = [
    {
      title: 'Black leather wallet with student ID',
      description: 'Lost near the library entrance. Contains a student ID (name: Alice V.), two debit cards, and around 400 rupees. Small stitching tear on the inside pocket.',
      category: 'Accessories', location: 'Central Library', daysAgo: 2,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=60',
      type: 'lost', rewardAmount: 500, rewardStatus: 'pending', createdBy: aliceId
    },
    {
      title: 'Silver MacBook Air 13" charger',
      description: 'USB-C 30W charger, left plugged in at the study room. Has a small sticker with initials "BN" on the brick.',
      category: 'Electronics', location: 'Study Hall, 2nd floor', daysAgo: 1,
      type: 'lost', rewardAmount: 300, rewardStatus: 'not_declared', createdBy: bobId
    },
    {
      title: 'Blue Decathlon backpack',
      description: 'Found in the canteen around 1pm. Contains a notebook, a water bottle, and a pair of headphones. Please claim with contents description.',
      category: 'Accessories', location: 'Main Canteen', daysAgo: 1,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=60',
      type: 'found', status: 'open', createdBy: chitraId
    },
    {
      title: 'Spectacles in brown hard case',
      description: 'Black wire-rimmed glasses inside a brown case marked "Titan Eye+". Found on the bench outside Block C.',
      category: 'Accessories', location: 'Block C courtyard', daysAgo: 4,
      type: 'found', status: 'open', createdBy: devId
    },
    {
      title: 'Set of house keys with red keychain',
      description: '3 keys on a carabiner, red enamel keychain shaped like a leaf. Dropped somewhere between the parking lot and the main gate.',
      category: 'Keys', location: 'Parking lot B', daysAgo: 6,
      type: 'lost', rewardAmount: 200, rewardStatus: 'pending', createdBy: eshaId
    },
    {
      title: 'Operating Systems textbook (Silberschatz, 10e)',
      description: 'Hardcover, has my name "Dev K." in pencil on the inside cover and highlights in Chapter 6. Left on a desk in the CS lab.',
      category: 'Books', location: 'CS Lab, Block D', daysAgo: 3,
      type: 'lost', rewardAmount: 0, rewardStatus: 'not_declared', createdBy: devId
    },
    {
      title: 'Black Casio F-91W watch',
      description: 'Standard digital watch, strap has a small crack near the buckle. Found on a sink in the gents washroom near the auditorium.',
      category: 'Accessories', location: 'Auditorium washroom', daysAgo: 2,
      type: 'found', status: 'open', createdBy: bobId
    },
    {
      title: 'Grey hoodie size M',
      description: 'Adidas grey hoodie, size M, zipper slightly stiff. Left on the back of a chair during yesterday\'s club meeting.',
      category: 'Clothing', location: 'Club room, Student Center', daysAgo: 1,
      type: 'found', status: 'open', createdBy: aliceId
    },
    {
      title: 'iPhone 13, midnight black',
      description: 'Black silicone case with a subtle dent in the back. Screen has a faint crack at the top-right corner. Last seen at the coffee kiosk.',
      category: 'Electronics', location: 'Coffee kiosk, Main building', daysAgo: 0,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=60',
      type: 'lost', rewardAmount: 2000, rewardStatus: 'pending', createdBy: chitraId
    },
    {
      title: 'University ID card — name "Esha P."',
      description: 'Student ID found near the shuttle stop. Will hand over at the security desk tomorrow morning if unclaimed.',
      category: 'Documents', location: 'Shuttle stop', daysAgo: 0,
      type: 'found', status: 'claimed', createdBy: devId
    },
    {
      title: 'Pair of AirPods Pro (case only)',
      description: 'Found the charging case alone without the buds inside. Case has a sticker that says "Go Tigers!" on the bottom.',
      category: 'Electronics', location: 'Gym locker room', daysAgo: 5,
      type: 'found', status: 'open', createdBy: eshaId
    },
    {
      title: 'Brown umbrella with wooden handle',
      description: 'Classic full-size umbrella, wooden curved handle. Lost during Monday\'s rainstorm somewhere between the cafeteria and the hostel.',
      category: 'Other', location: 'Cafeteria / Hostel path', daysAgo: 7,
      type: 'lost', rewardAmount: 0, rewardStatus: 'not_declared', createdBy: bobId
    },
    {
      title: 'Returned: black Parker ballpoint pen',
      description: 'Engraved with initials "C.R." — handed back to its owner on Tuesday. Thanks to everyone who reached out.',
      category: 'Other', location: 'Dean\'s office', daysAgo: 10,
      type: 'found', status: 'returned', createdBy: chitraId
    },
    {
      title: 'Silver bracelet with charm',
      description: 'Thin silver bracelet with a small star charm. Sentimental value — gifted by my grandmother.',
      category: 'Accessories', location: 'Lecture Theatre 2', daysAgo: 8,
      type: 'lost', rewardAmount: 1000, rewardStatus: 'completed', status: 'returned', createdBy: aliceId
    }
  ];

  for (const d of demoItems) {
    const exists = await ItemModel.findOne({ title: d.title, createdBy: d.createdBy }).lean();
    if (exists) continue;
    await ItemModel.create({
      title: d.title,
      description: d.description,
      categoryId: catByName.get(d.category) ?? null,
      location: d.location,
      dateLostOrFound: iso(d.daysAgo),
      imageUrl: d.imageUrl ?? null,
      type: d.type,
      status: d.status ?? 'open',
      rewardAmount: d.rewardAmount ?? 0,
      rewardStatus: d.rewardStatus ?? 'not_declared',
      createdBy: d.createdBy
    });
  }

  const bagItem = await ItemModel.findOne({ title: 'Blue Decathlon backpack' }).lean();
  const walletItem = await ItemModel.findOne({ title: 'Black leather wallet with student ID' }).lean();
  const idItem = await ItemModel.findOne({ title: 'University ID card — name "Esha P."' }).lean();
  const watchItem = await ItemModel.findOne({ title: 'Black Casio F-91W watch' }).lean();

  async function upsertClaim(itemId: Types.ObjectId, claimerId: Types.ObjectId, message: string, status: 'pending' | 'accepted' | 'rejected' = 'pending') {
    const exists = await ClaimModel.findOne({ itemId, claimerId }).lean();
    if (exists) return;
    await ClaimModel.create({ itemId, claimerId, message, claimStatus: status });
  }

  if (bagItem) {
    await upsertClaim(bagItem._id, bobId, 'That\'s my bag — inside there should be a blue Lenovo notebook charger and a Sony WH-CH510 headphone with a red bumper sticker on the side.', 'pending');
    await upsertClaim(bagItem._id, eshaId, 'I think this might be mine, left it at the canteen around 12:45pm. Water bottle is a green Milton thermos.', 'pending');
  }
  if (walletItem) {
    await upsertClaim(walletItem._id, bobId, 'Found a black wallet matching this description earlier — happy to connect.', 'rejected');
  }
  if (idItem) {
    await upsertClaim(idItem._id, eshaId, 'That\'s my ID, thank you so much! I\'ll pick it up at the security desk.', 'accepted');
  }
  if (watchItem) {
    await upsertClaim(watchItem._id, aliceId, 'Could be my watch — Casio F-91W with a crack near the buckle. The strap has a tiny pen mark on the inside.', 'pending');
  }

  async function upsertNotification(userId: Types.ObjectId, message: string, isRead = false) {
    const exists = await NotificationModel.findOne({ userId, message }).lean();
    if (exists) return;
    await NotificationModel.create({ userId, message, isRead });
  }
  if (bagItem) {
    await upsertNotification(chitraId, 'New claim on your item "Blue Decathlon backpack".');
    await upsertNotification(chitraId, 'Another claim was submitted on "Blue Decathlon backpack".');
  }
  if (idItem) {
    await upsertNotification(eshaId, 'Your claim on "University ID card — name \\"Esha P.\\"" was accepted.', true);
  }

  console.log('Seed complete.');
  console.log('Accounts:');
  console.log('  admin@lostfound.local / admin123 (admin)');
  console.log('  alice@campus.edu      / password123');
  console.log('  bob@campus.edu        / password123');
  console.log('  chitra@campus.edu     / password123');
  console.log('  dev@campus.edu        / password123');
  console.log('  esha@campus.edu       / password123');
}

if (require.main === module) {
  seed()
    .then(() => db.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
