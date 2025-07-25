import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

interface SupabaseUser {
  user_id: string;
  username: string;
  email: string;
  role: string;
  full_name?: string | null;
  location?: string | null;
  dialect?: string | null;
  profile_picture_url?: string;
  right_arm_length?: number | null;
  shoulder_width?: number | null;
  left_arm_length?: number | null;
  upper_body_height?: number | null;
  hip_width?: number | null;
  created_at: string;
  TailorDetails?: { bio: string | null; rating: number }[] | null;
}

interface SupabaseChat {
  chat_id: string;
  user_id: string;
  tailor_id: string;
  created_at: string;
}

interface Chat {
  chat_id: string;
  user_id: string;
  tailor_id: string;
  created_at: string;
  customer: SupabaseUser;
  tailor: SupabaseUser;
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    console.error(
      "Authentication failed:",
      authError?.message || "No user found"
    );
    return NextResponse.json(
      { error: authError?.message || "Unauthorized access" },
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
    console.error(
      "User verification failed:",
      userError?.message || "Not a customer"
    );
    return NextResponse.json(
      { error: userError?.message || "Only customers can create chats" },
      { status: 403 }
    );
  }

  const { tailorId } = await request.json();

  if (!tailorId || typeof tailorId !== "string") {
    console.error("Invalid request payload: tailorId missing or invalid");
    return NextResponse.json({ error: "Invalid tailorId" }, { status: 400 });
  }

  // Verify tailor exists and is a tailor
  const { data: tailorData, error: tailorError } = await (
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
    .eq("user_id", tailorId)
    .eq("role", "tailor")
    .single()
    .returns<SupabaseUser>();

  if (tailorError || !tailorData) {
    console.error(
      "Failed to fetch tailor:",
      tailorError?.message || "Tailor not found"
    );
    return NextResponse.json(
      { error: tailorError?.message || "Tailor not found" },
      { status: 404 }
    );
  }

  // Fetch tailor details separately
  const { data: tailorDetails, error: tailorDetailsError } = await (
    await supabase
  )
    .from("tailordetails")
    .select("bio, rating")
    .eq("user_id", tailorId)
    .single();

  if (tailorDetailsError) {
    console.error(
      "Failed to fetch tailor details:",
      tailorDetailsError?.message
    );
    return NextResponse.json(
      { error: tailorDetailsError?.message || "Tailor details not found" },
      { status: 404 }
    );
  }

  // Check if chat already exists
  const { data: existingChat, error: existingChatError } = await (
    await supabase
  )
    .from("chat")
    .select(
      `
      chat_id,
      user_id,
      tailor_id,
      created_at
      `
    )
    .eq("user_id", authUser.id)
    .eq("tailor_id", tailorId)
    .single()
    .returns<SupabaseChat>();

  if (existingChat) {
    // Fetch customer data
    const { data: customerData, error: customerError } = await (
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
      .eq("user_id", existingChat.user_id)
      .single()
      .returns<SupabaseUser>();

    if (customerError || !customerData) {
      console.error(
        "Failed to fetch customer:",
        customerError?.message || "Customer not found"
      );
      return NextResponse.json(
        { error: customerError?.message || "Customer not found" },
        { status: 500 }
      );
    }

    // Fetch customer details separately
    const { data: customerDetails, error: customerDetailsError } = await (
      await supabase
    )
      .from("tailordetails")
      .select("bio, rating")
      .eq("user_id", existingChat.user_id)
      .single();

    if (customerDetailsError) {
      console.warn(
        "Customer details not found, proceeding without:",
        customerDetailsError.message
      );
    }

    const chat: Chat = {
      chat_id: existingChat.chat_id,
      user_id: existingChat.user_id,
      tailor_id: existingChat.tailor_id,
      created_at: existingChat.created_at,
      customer: {
        ...customerData,
        TailorDetails: customerDetails
          ? [{ bio: customerDetails.bio, rating: customerDetails.rating }]
          : null,
      },
      tailor: {
        ...tailorData,
        TailorDetails: tailorDetails
          ? [{ bio: tailorDetails.bio, rating: tailorDetails.rating }]
          : null,
      },
    };
    return NextResponse.json({ chat }, { status: 200 });
  }

  if (existingChatError && existingChatError.code !== "PGRST116") {
    console.error("Failed to check existing chat:", existingChatError.message);
    return NextResponse.json(
      { error: existingChatError.message || "Failed to check existing chat" },
      { status: 500 }
    );
  }

  // Create new chat
  const chatId = uuidv4();
  const { data: newChat, error: insertError } = await (
    await supabase
  )
    .from("chat")
    .insert({
      chat_id: chatId,
      user_id: authUser.id,
      tailor_id: tailorId,
      created_at: new Date().toISOString(),
    })
    .select(
      `
      chat_id,
      user_id,
      tailor_id,
      created_at
      `
    )
    .single()
    .returns<SupabaseChat>();

  if (insertError || !newChat) {
    console.error(
      "Failed to create chat:",
      insertError?.message || "Insert failed"
    );
    return NextResponse.json(
      { error: insertError?.message || "Failed to create chat" },
      { status: 500 }
    );
  }

  // Fetch customer data
  const { data: customerData, error: customerError } = await (
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
    .eq("user_id", newChat.user_id)
    .single()
    .returns<SupabaseUser>();

  if (customerError || !customerData) {
    console.error(
      "Failed to fetch customer:",
      customerError?.message || "Customer not found"
    );
    return NextResponse.json(
      { error: customerError?.message || "Customer not found" },
      { status: 500 }
    );
  }

  // Fetch customer details separately
  const { data: customerDetails, error: customerDetailsError } = await (
    await supabase
  )
    .from("tailordetails")
    .select("bio, rating")
    .eq("user_id", newChat.user_id)
    .single();

  if (customerDetailsError) {
    console.warn(
      "Customer details not found, proceeding without:",
      customerDetailsError.message
    );
  }

  const chat: Chat = {
    chat_id: newChat.chat_id,
    user_id: newChat.user_id,
    tailor_id: newChat.tailor_id,
    created_at: newChat.created_at,
    customer: {
      ...customerData,
      TailorDetails: customerDetails
        ? [{ bio: customerDetails.bio, rating: customerDetails.rating }]
        : null,
    },
    tailor: {
      ...tailorData,
      TailorDetails: tailorDetails
        ? [{ bio: tailorDetails.bio, rating: tailorDetails.rating }]
        : null,
    },
  };

  return NextResponse.json({ chat }, { status: 201 });
}
