export interface Message {
   _id: string; // UUID
   conversationId: string; // UUID of the conversation
   senderId: string;
   receiverId: string | string[];
   content: string;
   timestamp: Date;
   isRead: boolean;
   isModified: boolean;
}
