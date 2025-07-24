import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { User } from "@/lib/model/user";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    console.log("Auth error:", authError?.message);
    return NextResponse.json(
      { error: authError?.message || "Unauthorized" },
      { status: 401 }
    );
  }

  console.log("Authenticated user ID:", authUser.id);

  // Fetch user from Users table
  const { data: userData, error: dbError } = await (
    await supabase
  )
    .from("users") // Corrected table name
    .select(
      `
      user_id,
      username,
      email,
      role,
      full_name,
      location,
      dialect,
      profile_picture_url,
      right_arm_length,
      shoulder_width,
      left_arm_length,
      upper_body_height,
      hip_width,
      created_at
      `
    )
    .eq("user_id", authUser.id)
    .single();

  console.log("Query result - userData:", userData);
  console.log("Query result - dbError:", dbError);

  if (dbError || !userData) {
    console.log(
      "Database error or no data:",
      dbError?.message || "No user data"
    );
    return NextResponse.json(
      { error: dbError?.message || "User not found in database" },
      { status: 404 }
    );
  }

  // Fetch TailorDetails if role is "tailor"
  let tailorDetails: { bio: string | null; rating: number }[] | null = null;
  if (userData.role === "tailor") {
    const { data: tailorData, error: tailorError } = await (await supabase)
      .from("tailordetails")
      .select("bio, rating")
      .eq("user_id", authUser.id)
      .single();

    if (tailorError) {
      console.log("TailorDetails error:", tailorError.message);
      // Optionally handle this error (e.g., return 404 or proceed without TailorDetails)
    } else {
      tailorDetails = tailorData ? [tailorData] : null; // Wrap in array to match User interface
    }
  }

  const customUser: User = {
    user_id: userData.user_id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    full_name: userData.full_name,
    location: userData.location,
    dialect: userData.dialect,
    profile_picture_url: userData.profile_picture_url,
    right_arm_length: userData.right_arm_length,
    shoulder_width: userData.shoulder_width,
    left_arm_length: userData.left_arm_length,
    upper_body_height: userData.upper_body_height,
    hip_width: userData.hip_width,
    TailorDetails: tailorDetails,
    created_at: userData.created_at,
  };

  return NextResponse.json({ user: customUser });
}
