// export interface User {
//   uid: string;
//   email: string;
//   phone?: string;
//   user_metadata: Record<string, unknown>;
//   created_at: string;
// }

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: "customer" | "tailor";
  full_name: string | null;
  location: string | null;
  dialect: string | null;
  profile_picture_url: string;
  right_arm_length: number | null;
  shoulder_width: number | null;
  left_arm_length: number | null;
  upper_body_height: number | null;
  hip_width: number | null;
  TailorDetails: { bio: string | null; rating: number }[] | null;
  created_at: string;
}
