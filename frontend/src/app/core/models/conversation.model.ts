export interface Conversation {
   _id: string; // UUID
   createdAt: Date; // e.g. '2024-09-03T12:00:00Z'
   updatedAt: Date; // e.g. '2024-09-03T12:00:00Z'
   title?: string; // e.g. 'Project Discussion'
   type?: 'group' | 'one-on-one'; // e.g. 'group', 'one-on-one'
   members: string[]; // Array of user IDs (UUIDs)
   lastMessageId?: string; // UUID of the last message in the conversation
   isArchived?: boolean; // e.g. true or false
}
//
