import mongoose, {
   Model,
   Schema,
   Document as MongooseDocument,
} from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import * as argon2 from 'argon2';
import {
   User as UserInterface,
   ContactEmail,
   ContactAddress,
   ContactPhoneNumber,
   Website,
   Document as UserDocumentInterface,
   BankAccount,
} from './user.model'; // Assuming user.model.ts contains the interfaces

// Define sub-schemas
const ContactEmailSchema = new Schema<ContactEmail>(
   {
      address: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
      },
      type: {
         type: String,
         enum: ['personal', 'university'],
         default: 'personal',
      },
      isDefault: { type: Boolean, default: false },
   },
   { _id: false }
);

const ContactAddressSchema = new Schema<ContactAddress>(
   {
      country: { type: String, required: true },
      county: { type: String },
      postalCode: { type: Number, required: true },
      city: { type: String, required: true },
      streetAddress: { type: String, required: true },
      type: {
         type: String,
         enum: ['permanent', 'temporary'],
         default: 'permanent',
      },
   },
   { _id: false }
);

const ContactPhoneNumberSchema = new Schema<ContactPhoneNumber>(
   {
      number: { type: Number, required: true },
      isDefault: { type: Boolean, default: false },
   },
   { _id: false }
);

const WebsiteSchema = new Schema<Website>(
   {
      url: { type: String, required: true },
      type: { type: String, enum: ['personal', 'university', 'other'] },
   },
   { _id: false }
);

const UserDocumentSchema = new Schema<UserDocumentInterface>(
   {
      type: { type: String, required: true }, // e.g., 'personal id', 'student id'
      identifier: { type: String, required: true, unique: true },
      issueDate: { type: String, required: true }, // Consider using Date type if Mongoose handles it well with JSON
      expirationDate: { type: String, required: true }, // Consider using Date type
      mode: { type: String }, // e.g. 'full-time' for student id
   },
   { _id: false }
);

const BankAccountSchema = new Schema<BankAccount>(
   {
      accountNumber: { type: String, required: true, unique: true },
      owner: { type: String },
      type: {
         type: String,
         enum: ['domestic', 'international'],
         default: 'domestic',
      },
      bankName: { type: String },
      isValid: { type: Boolean, default: true },
      isDefault: { type: Boolean, default: false },
   },
   { _id: false }
);

// Define the main User Schema
export interface UserDocument extends UserInterface, MongooseDocument {}

const UserSchema = new Schema<UserDocument>(
   {
      _id: { type: String, default: () => uuidv7(), alias: 'id' },
      createdAt: { type: Date, default: Date.now },
      lastName: { type: String, required: true, trim: true },
      firstName: { type: String, required: true, trim: true },
      nickname: { type: String, trim: true },
      profilePicture: { type: String, trim: true },
      training: { type: String, trim: true },
      startDate: { type: String, required: true }, // Consider Date type
      theme: {
         type: String,
         enum: ['light', 'dark', 'system'],
         default: 'system',
      },
      language: { type: String, enum: ['en', 'hu'], default: 'en' },
      dateOfBirth: { type: String, required: true }, // Consider Date type
      countryOfBirth: { type: String, required: true },
      countyOfBirth: { type: String },
      placeOfBirth: { type: String, required: true },
      citizenship: { type: String, required: true },
      gender: { type: String, required: true },
      username: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         minlength: 3,
      },
      password: { type: String, required: true },
      tajNumber: { type: String, trim: true },
      taxId: { type: String, trim: true },
      educationId: { type: String, trim: true, unique: true, sparse: true }, // sparse allows null/undefined for uniqueness
      emails: [ContactEmailSchema],
      addresses: [ContactAddressSchema],
      phoneNumbers: [ContactPhoneNumberSchema],
      documents: [UserDocumentSchema],
      bankAccounts: [BankAccountSchema],
      websites: [WebsiteSchema],
   },
   {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

// Pre-save hook for password hashing (if using Mongoose with a real DB)
// For JSON file, hashing is done during registration route.
UserSchema.pre<UserDocument>('save', async function (next) {
   if (!this.isModified('password')) return next();
   try {
      const salt = await argon2.hash(this.password, { type: argon2.argon2id });
      this.password = salt; // In a real scenario, you'd store the hash
      next();
   } catch (err) {
      // Make sure to handle the error, for example by passing it to next
      // For TypeScript, 'err' might be of type 'unknown', so you might need to cast or check its type
      next(err as Error);
   }
});

// Method to compare password (if using Mongoose with a real DB)
UserSchema.methods.comparePassword = async function (
   candidatePassword: string
): Promise<boolean> {
   return argon2.verify(this.password, candidatePassword);
};

// Ensure nickname defaults to firstName + lastName if not provided
UserSchema.pre<UserDocument>('save', function (next) {
   if (!this.nickname && this.firstName && this.lastName) {
      this.nickname = `${this.firstName} ${this.lastName}`;
   }
   next();
});

// Export the model - though we are not connecting to MongoDB yet,
// this structure is good practice.
// For now, this User model won't be directly used with Mongoose connection in server.ts
// but the schema definition is useful.
const User: Model<UserDocument> = mongoose.model<UserDocument>(
   'User',
   UserSchema
);
export default User;
