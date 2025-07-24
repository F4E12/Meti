import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Chat } from "@/lib/model/chat";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/lib/model/user";

// Define the expected shape of the Supabase response
interface SupabaseUser {
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
  created_at: string;
  TailorDetails: { bio: string | null; rating: number } | null;
}

interface SupabaseChat {
  chat_id: string;
  user_id: string;
  tailor_id: string;
  created_at: string;
  customer: SupabaseUser | null;
  tailor: SupabaseUser | null;
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    console.error("Auth error:", authError?.message);
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
    console.error("User error or not a customer:", userError?.message);
    return NextResponse.json(
      { error: userError?.message || "Only customers can create chats" },
      { status: 403 }
    );
  }

  const { tailorId } = await request.json();

  if (!tailorId || typeof tailorId !== "string") {
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
      created_at,
      TailorDetails (bio, rating)
      `
    )
    .eq("user_id", tailorId)
    .eq("role", "tailor")
    .single()
    .returns<SupabaseUser>();

  if (tailorError || !tailorData) {
    console.error("Error fetching tailor:", tailorError?.message);
    return NextResponse.json(
      { error: tailorError?.message || "Tailor not found" },
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
      created_at,
      customer:Users!user_id (
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
        created_at,
        TailorDetails (bio, rating)
      ),
      tailor:Users!tailor_id (
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
        created_at,
        TailorDetails (bio, rating)
      )
      `
    )
    .eq("user_id", authUser.id)
    .eq("tailor_id", tailorId)
    .single()
    .returns<SupabaseChat>();

  if (existingChat) {
    const chat: Chat = {
      chat_id: existingChat.chat_id,
      user_id: existingChat.user_id,
      tailor_id: existingChat.tailor_id,
      created_at: existingChat.created_at,
      customer: existingChat.customer
        ? {
            ...existingChat.customer,
            TailorDetails: existingChat.customer.TailorDetails
              ? [existingChat.customer.TailorDetails]
              : null,
          }
        : ({} as User),
      tailor: existingChat.tailor
        ? {
            ...existingChat.tailor,
            TailorDetails: existingChat.tailor.TailorDetails
              ? [existingChat.tailor.TailorDetails]
              : null,
          }
        : ({} as User),
    };
    return NextResponse.json({ chat }, { status: 200 });
  }

  if (existingChatError && existingChatError.code !== "PGRST116") {
    console.error("Error checking existing chat:", existingChatError.message);
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
      created_at,
      customer:Users!user_id (
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
        created_at,
        TailorDetails (bio, rating)
      ),
      tailor:Users!tailor_id (
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
        created_at,
        TailorDetails (bio, rating)
      )
      `
    )
    .single()
    .returns<SupabaseChat>();

  if (insertError || !newChat) {
    console.error("Error creating chat:", insertError?.message);
    return NextResponse.json(
      { error: insertError?.message || "Failed to create chat" },
      { status: 500 }
    );
  }

  // Check for null customer or tailor
  if (!newChat.customer || !newChat.tailor) {
    console.error("Customer or tailor data missing for chat:", chatId);
    return NextResponse.json({ error: "Invalid chat data" }, { status: 500 });
  }

  const chat: Chat = {
    chat_id: newChat.chat_id,
    user_id: newChat.user_id,
    tailor_id: newChat.tailor_id,
    created_at: newChat.created_at,
    customer: {
      ...newChat.customer,
      TailorDetails: newChat.customer.TailorDetails
        ? [newChat.customer.TailorDetails]
        : null,
    },
    tailor: {
      ...newChat.tailor,
      TailorDetails: newChat.tailor.TailorDetails
        ? [newChat.tailor.TailorDetails]
        : null,
    },
  };

  return NextResponse.json({ chat }, { status: 201 });
}
