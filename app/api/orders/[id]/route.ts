import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: order_id } = await params;

  // Get authenticated user
  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json(
      { error: authError?.message || "Unauthorized" },
      { status: 401 }
    );
  }

  // Fetch user role
  const { data: userData, error: userError } = await (await supabase)
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json(
      { error: userError?.message || "User not found" },
      { status: 404 }
    );
  }

  // Fetch order details
  const { data: orderData, error: orderError } = await (await supabase)
    .from("orders")
    .select(
      "order_id, user_id, tailor_id, status, design_url, order_date, delivery_date, created_at"
    )
    .eq("order_id", order_id)
    .or(`user_id.eq.${authUser.id},tailor_id.eq.${authUser.id}`)
    .single();

  if (orderError || !orderData) {
    return NextResponse.json(
      { error: orderError?.message || "Order not found or unauthorized" },
      { status: 404 }
    );
  }

  // Fetch customer details
  const { data: customerData, error: customerError } = await (await supabase)
    .from("users")
    .select(
      "full_name, profile_picture_url, right_arm_length, shoulder_width, left_arm_length, upper_body_height, hip_width"
    )
    .eq("user_id", orderData.user_id)
    .single();

  // Fetch tailor details
  const { data: tailorData, error: tailorError } = await (await supabase)
    .from("users")
    .select("full_name, profile_picture_url")
    .eq("user_id", orderData.tailor_id)
    .single();

  // Fetch tailor details bio and rating
  const { data: tailorDetailsData, error: tailorDetailsError } = await (
    await supabase
  )
    .from("tailordetails")
    .select("bio, rating")
    .eq("user_id", orderData.tailor_id)
    .single();

  if (tailorDetailsError) {
    console.error(tailorDetailsError);
  }

  if (customerError || !customerData || tailorError || !tailorData) {
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }

  const enrichedOrder = {
    ...orderData,
    customer: customerData,
    tailor: {
      full_name: tailorData.full_name,
      profile_picture_url: tailorData.profile_picture_url,
      bio: tailorDetailsData?.bio || null,
      rating: tailorDetailsData?.rating || 0,
    },
  };

  return NextResponse.json({ order: enrichedOrder });
}
