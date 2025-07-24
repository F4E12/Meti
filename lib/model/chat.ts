import { Message } from "./message";
import { User } from "./user";

export interface Chat {
  chat_id: string;
  user_id: string; // Customer
  tailor_id: string; // Tailor
  customer: User; // Customer details
  tailor: User; // Tailor details
  created_at: string;
  last_message?: Message; // Optional: Last message for preview
}
