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

  // Fetch all tailors
  const { data: tailorUsers, error: userError } = await (
    await supabase
  )
    .from("users")
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
    .eq("role", "tailor");

  if (userError || !tailorUsers) {
    console.error("Error fetching tailors:", userError?.message);
    return NextResponse.json(
      { error: userError?.message || "Failed to fetch tailors" },
      { status: 500 }
    );
  }

  // Fetch all TailorDetails in bulk for better performance
  const { data: tailorDetails, error: detailsError } = await (await supabase)
    .from("tailordetails")
    .select("user_id, bio, rating");

  if (detailsError) {
    console.warn("Error fetching TailorDetails:", detailsError.message);
  }

  const detailsMap = new Map<string, { bio: string | null; rating: number }>();
  tailorDetails?.forEach((detail) => {
    detailsMap.set(detail.user_id, {
      bio: detail.bio,
      rating: detail.rating,
    });
  });

  const tailors: User[] = tailorUsers.map((user) => ({
    ...user,
    TailorDetails: detailsMap.has(user.user_id)
      ? [detailsMap.get(user.user_id)!]
      : null,
  }));

  return NextResponse.json({ tailors });
}
