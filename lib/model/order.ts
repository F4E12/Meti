import { User } from "./user";

export interface Order {
  order_id: string;
  user_id: string;
  tailor_id: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  design_url: string;
  order_date: string;
  delivery_date?: string;
  created_at: string;
  tailor?: User & { bio?: string; rating: number };
  customer?: User;
}
