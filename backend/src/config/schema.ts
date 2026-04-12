import { Schema, model, Types } from 'mongoose';
import { ClaimStatus, ItemStatus, ItemType, RewardStatus, UserRole } from '../types/domain';

/**
 * Mongoose schemas — authoritative persistence definitions for each
 * collection. `toJSON` transforms normalize `_id → id` so that API clients
 * never see Mongo-specific fields.
 */

const stripMongoInternals = {
  virtuals: true,
  versionKey: false,
  transform: (_: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  }
};

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    isSuspended: { type: Boolean, default: false, required: true }
  },
  { timestamps: true, toJSON: stripMongoInternals, toObject: stripMongoInternals }
);

export interface CategoryDoc {
  _id: Types.ObjectId;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null }
  },
  { timestamps: true, toJSON: stripMongoInternals, toObject: stripMongoInternals }
);

export interface ItemDoc {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categoryId: Types.ObjectId | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    location: { type: String, required: true, trim: true },
    dateLostOrFound: { type: String, required: true },
    imageUrl: { type: String, default: null },
    type: { type: String, enum: ['lost', 'found'], required: true, index: true },
    status: { type: String, enum: ['open', 'claimed', 'returned', 'closed'], default: 'open', index: true },
    rewardAmount: { type: Number, default: 0 },
    rewardStatus: { type: String, enum: ['not_declared', 'pending', 'completed'], default: 'not_declared' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true, toJSON: stripMongoInternals, toObject: stripMongoInternals }
);

export interface ClaimDoc {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  claimerId: Types.ObjectId;
  message: string;
  claimStatus: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<ClaimDoc>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    claimerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    claimStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  },
  { timestamps: true, toJSON: stripMongoInternals, toObject: stripMongoInternals }
);
ClaimSchema.index({ itemId: 1, claimerId: 1 }, { unique: true });

export interface NotificationDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true, toJSON: stripMongoInternals, toObject: stripMongoInternals }
);

export const UserModel = model<UserDoc>('User', UserSchema);
export const CategoryModel = model<CategoryDoc>('Category', CategorySchema);
export const ItemModel = model<ItemDoc>('Item', ItemSchema);
export const ClaimModel = model<ClaimDoc>('Claim', ClaimSchema);
export const NotificationModel = model<NotificationDoc>('Notification', NotificationSchema);
