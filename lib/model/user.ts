export interface User {
  uid: string;
  email: string;
  phone?: string;
  user_metadata: Record<string, unknown>;
  created_at: string;
}
