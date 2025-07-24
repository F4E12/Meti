// app/api/chats/[chatId]/messages/route.ts
import { Message } from "@/lib/model/message";
import { User } from "@/lib/model/user";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

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

export async function POST(
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

  // Verify chat exists and user is part of it
  const { data: chatData, error: chatError } = await (await supabase)
    .from("Chat")
    .select("chat_id, user_id, tailor_id")
    .eq("chat_id", chatId)
    .single();

  if (chatError || !chatData) {
    console.error("Error fetching chat:", chatError?.message);
    return NextResponse.json(
      { error: chatError?.message || "Chat not found" },
      { status: 404 }
    );
  }

  if (chatData.user_id !== authUser.id && chatData.tailor_id !== authUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content, language, translated_content } = await request.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Invalid message content" },
      { status: 400 }
    );
  }

  // Insert new message
  const messageId = uuidv4();
  const { data: newMessage, error: insertError } = await (
    await supabase
  )
    .from("Messages")
    .insert({
      message_id: messageId,
      chat_id: chatId,
      sender_id: authUser.id,
      content,
      translated_content: translated_content || null,
      language: language || null,
      created_at: new Date().toISOString(),
    })
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
    .single()
    .returns<SupabaseMessage>();

  if (insertError || !newMessage) {
    console.error("Error sending message:", insertError?.message);
    return NextResponse.json(
      { error: insertError?.message || "Failed to send message" },
      { status: 500 }
    );
  }

  // Check for null sender
  if (!newMessage.sender) {
    console.error("Sender data missing for message:", messageId);
    return NextResponse.json(
      { error: "Invalid message data" },
      { status: 500 }
    );
  }

  const message: Message = {
    message_id: newMessage.message_id,
    chat_id: newMessage.chat_id,
    sender_id: newMessage.sender_id,
    content: newMessage.content,
    translated_content: newMessage.translated_content,
    language: newMessage.language,
    created_at: newMessage.created_at,
    sender: {
      ...newMessage.sender,
      TailorDetails: newMessage.sender.TailorDetails
        ? [newMessage.sender.TailorDetails]
        : null,
    },
  };

  return NextResponse.json({ message }, { status: 201 });
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

  // Verify chat exists and user is part of it
  const { data: chatData, error: chatError } = await (await supabase)
    .from("Chat")
    .select("chat_id, user_id, tailor_id")
    .eq("chat_id", chatId)
    .single();

  if (chatError || !chatData) {
    console.error("Error fetching chat:", chatError?.message);
    return NextResponse.json(
      { error: chatError?.message || "Chat not found" },
      { status: 404 }
    );
  }

  if (chatData.user_id !== authUser.id && chatData.tailor_id !== authUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch messages
  const { data: messagesData, error: messagesError } = await (
    await supabase
  )
    .from("Messages")
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

  return NextResponse.json({ messages });
}
