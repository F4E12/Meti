import { User } from "./user";

export interface Message {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: Record<string, string> | null;
  language: string | null;
  created_at: string;
  sender: User; // Sender details
}
