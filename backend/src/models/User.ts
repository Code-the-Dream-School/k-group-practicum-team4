import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface IUser extends Document {
  displayName: string;
  email: string;
  password: string;
  avatarId: string;
  createdAt: Date;

  createJWT(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  displayName: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false, // Never return password by default
  },
  avatarId: {
    type: String,
    required: [true, 'Please provide avatar'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

/**
 * Hash password before saving if it was modified
 */
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Create JWT token for user
 */
UserSchema.methods.createJWT = function (): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const options = {
    expiresIn: process.env.JWT_LIFETIME || '24h',
  } as SignOptions;

  return jwt.sign(
    {
      userId: this._id.toString(),
      displayName: this.displayName,
      email: this.email,
      avatarId: this.avatarId,
    },
    secret,
    options
  );
};

/**
 * Compare candidate password with stored hash
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * User model
 */
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
