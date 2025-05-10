export interface ContactEmail {
   address: string;
   type: string; // e.g. 'personal', 'university'
   isDefault: boolean;
}

export interface ContactAddress {
   country: string;
   county: string;
   postalCode: number;
   city: string;
   streetAddress: string;
   type: string; // e.g. 'permanent', 'temporary'
}

export interface ContactPhoneNumber {
   number: number;
   isDefault: boolean;
}

export interface Website {
   url: string;
   type?: string; // e.g. 'personal', 'university'
}

export interface Document {
   type: string; // e.g. 'personal id', 'student id'
   identifier: string;
   issueDate: string;
   expirationDate: string;
   mode?: string; // e.g. 'full-time'
}

export interface BankAccount {
   accountNumber: string;
   owner?: string;
   type: string; // e.g. 'domestic', 'international'
   bankName?: string; // e.g. 'OTP Bank', 'K&H Bank'
   isValid: boolean;
   isDefault: boolean;
}

export interface User {
   _id: string; // UUID V7
   createdAt: string; // e.g. '2024-09-03T12:00:00Z'
   lastName: string;
   firstName: string;

   nickname: string; // By default, the first- and last name is used as a nickname
   profilePicture?: string; // URL to the profile picture
   training: string; // e.g. 'BSc in Computer Science'
   startDate: string;
   theme?: 'light' | 'dark' | 'system';
   language?: 'en' | 'hu';

   dateOfBirth: string;
   countryOfBirth: string;
   countyOfBirth: string;
   placeOfBirth: string;
   citizenship: string;
   gender: string;

   username: string;
   password: string; // uuid V7

   tajNumber: string;
   taxId: string;
   educationId: string;

   emails: ContactEmail[];
   addresses: ContactAddress[];
   phoneNumbers: ContactPhoneNumber[];

   documents: Document[];

   bankAccounts?: BankAccount[];

   websites?: Website[];
}
