// /app/api/orders/[id]/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const order_id = params.id;

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
      "order_id, user_id, tailor_id, status, order_date, delivery_date, created_at, design_id, user_design_id"
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

  // Fetch design details if design_id exists
  let design = null;
  if (orderData.design_id) {
    const { data, error } = await (await supabase)
      .from("designs")
      .select("design_id, original_image_url, description")
      .eq("design_id", orderData.design_id)
      .single();
    if (!error && data) design = data;
  }

  // Fetch user design details if user_design_id exists
  let userDesign = null;
  if (orderData.user_design_id) {
    const { data, error } = await (await supabase)
      .from("userdesigns")
      .select("user_design_id, customized_image_url, color_palette")
      .eq("user_design_id", orderData.user_design_id)
      .single();
    if (!error && data) userDesign = data;
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
    design,
    user_design: userDesign,
  };

  return NextResponse.json({ order: enrichedOrder });
}
