import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

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

  const role = userData.role;

  // Fetch orders based on role
  let orders;
  let ordersError;
  if (role === "customer") {
    const { data, error } = await (await supabase)
      .from("orders")
      .select(
        "order_id, user_id, tailor_id, status, design_url, order_date, delivery_date, created_at"
      )
      .eq("user_id", authUser.id);
    orders = data;
    ordersError = error;
  } else if (role === "tailor") {
    const { data, error } = await (await supabase)
      .from("orders")
      .select(
        "order_id, user_id, tailor_id, status, design_url, order_date, delivery_date, created_at"
      )
      .eq("tailor_id", authUser.id);
    orders = data;
    ordersError = error;
  } else {
    return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
  }

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  // Fetch additional details for each order
  const enrichedOrders = [];
  for (const order of orders || []) {
    let additionalData = {};
    if (role === "customer") {
      // Fetch tailor details
      const { data: tailorData, error: tailorError } = await (await supabase)
        .from("users")
        .select("full_name, profile_picture_url")
        .eq("user_id", order.tailor_id)
        .single();

      // Fetch tailor details bio and rating
      const { data: tailorDetailsData, error: tailorDetailsError } = await (
        await supabase
      )
        .from("tailordetails")
        .select("bio, rating")
        .eq("user_id", order.tailor_id)
        .single();

      if (tailorDetailsError) {
        console.error(tailorDetailsError);
      }

      if (!tailorError && tailorData) {
        additionalData = {
          ...additionalData,
          tailor: {
            full_name: tailorData.full_name,
            profile_picture_url: tailorData.profile_picture_url,
            bio: tailorDetailsData?.bio || null,
            rating: tailorDetailsData?.rating || 0,
          },
        };
      }
    } else if (role === "tailor") {
      // Fetch customer details
      const { data: customerData, error: customerError } = await (
        await supabase
      )
        .from("users")
        .select("full_name, profile_picture_url")
        .eq("user_id", order.user_id)
        .single();

      if (!customerError && customerData) {
        additionalData = {
          ...additionalData,
          customer: {
            full_name: customerData.full_name,
            profile_picture_url: customerData.profile_picture_url,
          },
        };
      }
    }
    enrichedOrders.push({ ...order, ...additionalData });
  }

  return NextResponse.json({ orders: enrichedOrders });
}

export async function POST(request: Request) {
  const supabase = await createClient();

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

  // Verify user is a customer
  const { data: userData, error: userError } = await (await supabase)
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .single();

  if (userError || !userData || userData.role !== "customer") {
    return NextResponse.json(
      { error: userError?.message || "Only customers can place orders" },
      { status: 403 }
    );
  }

  // Parse request body
  const body = await request.json();
  const { tailor_id, design_url } = body;

  // Validate input
  if (!tailor_id || !design_url) {
    return NextResponse.json(
      { error: "tailor_id and design_url are required" },
      { status: 400 }
    );
  }

  // Verify tailor exists and is a tailor
  const { data: tailorData, error: tailorError } = await (await supabase)
    .from("users")
    .select("user_id, role")
    .eq("user_id", tailor_id)
    .eq("role", "tailor")
    .single();

  if (tailorError || !tailorData) {
    return NextResponse.json(
      { error: tailorError?.message || "Invalid tailor" },
      { status: 400 }
    );
  }

  // Create new order
  const { data: orderData, error: orderError } = await (
    await supabase
  )
    .from("orders")
    .insert({
      user_id: authUser.id,
      tailor_id,
      status: "pending",
      design_url,
      order_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  return NextResponse.json({ order: orderData });
}
