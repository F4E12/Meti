// app/api/chats/[chatId]/route.ts
import { Chat } from "@/lib/model/chat";
import { Message } from "@/lib/model/message";
import { User } from "@/lib/model/user";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

interface SupabaseMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: Record<string, string> | null;
  language: string | null;
  created_at: string;
  sender: SupabaseUser | null;
}

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const supabase = createClient();
  const chatId = params.chatId;

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

  // Fetch chat details
  const { data: chatData, error: chatError } = await (
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
    .eq("chat_id", chatId)
    .single()
    .returns<SupabaseChat>();

  if (chatError || !chatData) {
    console.error("Error fetching chat:", chatError?.message);
    return NextResponse.json(
      { error: chatError?.message || "Chat not found" },
      { status: 404 }
    );
  }

  // Verify user is part of the chat
  if (chatData.user_id !== authUser.id && chatData.tailor_id !== authUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check for null customer or tailor
  if (!chatData.customer || !chatData.tailor) {
    console.error("Customer or tailor data missing for chat:", chatId);
    return NextResponse.json({ error: "Invalid chat data" }, { status: 500 });
  }

  // Fetch all messages for the chat
  const { data: messagesData, error: messagesError } = await (
    await supabase
  )
    .from("messages")
    .select(
      `
      message_id,
      chat_id,
      sender_id,
      content,
      translated_content,
      language,
      created_at,
      sender:Users!sender_id (
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
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .returns<SupabaseMessage[]>();

  if (messagesError) {
    console.error("Error fetching messages:", messagesError.message);
    return NextResponse.json(
      { error: messagesError.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }

  const chat: Chat = {
    chat_id: chatData.chat_id,
    user_id: chatData.user_id,
    tailor_id: chatData.tailor_id,
    created_at: chatData.created_at,
    customer: {
      ...chatData.customer,
      TailorDetails: chatData.customer.TailorDetails
        ? [chatData.customer.TailorDetails]
        : null,
    },
    tailor: {
      ...chatData.tailor,
      TailorDetails: chatData.tailor.TailorDetails
        ? [chatData.tailor.TailorDetails]
        : null,
    },
  };

  const messages: Message[] = messagesData.map((msg) => ({
    message_id: msg.message_id,
    chat_id: msg.chat_id,
    sender_id: msg.sender_id,
    content: msg.content,
    translated_content: msg.translated_content,
    language: msg.language,
    created_at: msg.created_at,
    sender: msg.sender
      ? {
          ...msg.sender,
          TailorDetails: msg.sender.TailorDetails
            ? [msg.sender.TailorDetails]
            : null,
        }
      : ({} as User), // Fallback if sender is null (unlikely)
  }));

  return NextResponse.json({ chat, messages });
}
