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

export interface UserPreferences {
   // Added this from previous step, ensure it's here
   receiveNotifications: boolean;
   preferredContactMethod: 'email' | 'phone' | 'none';
}

export interface User {
   _id: string;
   createdAt: string;
   updatedAt?: string;
   lastName: string;
   firstName: string;
   nickname?: string;
   profilePicture?: string;
   training?: string;
   startDate: string;
   theme?: 'light' | 'dark' | 'system';
   language?: 'en' | 'hu';
   dateOfBirth: string;
   countryOfBirth: string;
   countyOfBirth?: string;
   placeOfBirth: string;
   citizenship: string;
   gender: string;
   username: string;
   password?: string;
   tajNumber?: string;
   taxId?: string;
   educationId?: string;
   emails: ContactEmail[];
   addresses: ContactAddress[];
   phoneNumbers: ContactPhoneNumber[];
   documents: Document[];
   bankAccounts?: BankAccount[]; // <<<< Ensured this is plural
   websites?: Website[];
   preferences?: UserPreferences; // <<<< Added from previous step
}
