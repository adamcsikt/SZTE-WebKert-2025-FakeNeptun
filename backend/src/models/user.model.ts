export interface ContactEmail {
   address: string;
   type: 'personal' | 'university';
   isDefault: boolean;
}

export interface ContactAddress {
   country: string;
   county?: string;
   postalCode: number;
   city: string;
   streetAddress: string;
   type: 'permanent' | 'temporary';
}

export interface ContactPhoneNumber {
   number: number; // Consider string if it can include special chars like '+'
   isDefault: boolean;
}

export interface Website {
   url: string;
   type?: 'personal' | 'university' | 'other';
}

export interface Document {
   type: string; // e.g. 'personal id', 'student id'
   identifier: string;
   issueDate: string; // ISO Date string e.g., '2024-05-17'
   expirationDate: string; // ISO Date string
   mode?: string; // e.g. 'full-time'
}

export interface BankAccount {
   accountNumber: string;
   owner?: string;
   type: 'domestic' | 'international';
   bankName?: string;
   isValid: boolean;
   isDefault: boolean;
}

export interface User {
   _id: string; // UUID V7
   createdAt: string; // ISO DateTime string e.g., '2024-09-03T12:00:00Z'
   updatedAt?: string; // ISO DateTime string
   lastName: string;
   firstName: string;

   nickname?: string;
   profilePicture?: string; // URL
   training?: string;
   startDate: string; // ISO Date string
   theme?: 'light' | 'dark' | 'system';
   language?: 'en' | 'hu';

   dateOfBirth: string; // ISO Date string
   countryOfBirth: string;
   countyOfBirth?: string;
   placeOfBirth: string;
   citizenship: string;
   gender: string;

   username: string;
   password?: string; // Hashed password, not always sent to client

   tajNumber?: string;
   taxId?: string;
   educationId?: string;

   emails: ContactEmail[];
   addresses: ContactAddress[];
   phoneNumbers: ContactPhoneNumber[];
   documents: Document[];
   bankAccounts?: BankAccount[];
   websites?: Website[];
}
