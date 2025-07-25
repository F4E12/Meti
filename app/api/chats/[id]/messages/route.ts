import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Message } from "@/lib/model/message";
import { User } from "@/lib/model/user";
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
  tailordetails: { bio: string | null; rating: number }[] | null;
}

interface SupabaseMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: string | null;
  language: string | null;
  created_at: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const chatId = params.id;

  console.log("POST /api/chats/[id]/messages called with chatId:", chatId);

  // Validate chatId
  if (!chatId || chatId === "undefined") {
    console.error("Invalid chatId: chatId is undefined or invalid");
    return NextResponse.json(
      { error: "Invalid or missing chatId" },
      { status: 400 }
    );
  }

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

  // Verify chat exists and user is part of it
  const { data: chatData, error: chatError } = await (await supabase)
    .from("chat")
    .select("chat_id, user_id, tailor_id")
    .eq("chat_id", chatId)
    .single();

  if (chatError || !chatData) {
    console.error(
      "Failed to fetch chat:",
      chatError?.message || "Chat not found"
    );
    return NextResponse.json(
      { error: chatError?.message || "Chat not found" },
      { status: 404 }
    );
  }

  if (chatData.user_id !== authUser.id && chatData.tailor_id !== authUser.id) {
    console.error("Access forbidden: User not part of chat", {
      userId: authUser.id,
      chatId,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content, language, translated_content } = await request.json();

  if (!content || typeof content !== "string") {
    console.error(
      "Invalid request payload: Missing or invalid message content"
    );
    return NextResponse.json(
      { error: "Invalid message content" },
      { status: 400 }
    );
  }

  // Insert new message
  const messageId = uuidv4();
  const { data: newMessageData, error: insertError } = await (
    await supabase
  )
    .from("messages")
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
      created_at
      `
    )
    .single()
    .returns<SupabaseMessage>();

  if (insertError || !newMessageData) {
    console.error(
      "Failed to send message:",
      insertError?.message || "Insert failed"
    );
    return NextResponse.json(
      { error: insertError?.message || "Failed to send message" },
      { status: 500 }
    );
  }

  // Fetch sender data separately
  const { data: senderData, error: senderError } = await (
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
    .eq("user_id", newMessageData.sender_id)
    .single()
    .returns<SupabaseUser>();

  if (senderError || !senderData) {
    console.error(
      "Failed to fetch sender:",
      senderError?.message || "Sender not found"
    );
    return NextResponse.json(
      { error: senderError?.message || "Sender not found" },
      { status: 500 }
    );
  }

  // Fetch sender tailordetails if sender is a tailor
  let senderDetails: { bio: string | null; rating: number } | null = null;
  if (senderData.role === "tailor") {
    const { data, error: senderDetailsError } = await (await supabase)
      .from("tailordetails")
      .select("bio, rating")
      .eq("user_id", newMessageData.sender_id)
      .single();

    if (senderDetailsError) {
      console.warn(
        "Sender tailordetails not found, proceeding without:",
        senderDetailsError.message
      );
    } else {
      senderDetails = data;
    }
  }

  const message: Message = {
    message_id: newMessageData.message_id,
    chat_id: newMessageData.chat_id,
    sender_id: newMessageData.sender_id,
    content: newMessageData.content,
    translated_content: newMessageData.translated_content
      ? JSON.parse(newMessageData.translated_content)
      : null,
    language: newMessageData.language,
    created_at: newMessageData.created_at,
    sender: {
      ...senderData,
      TailorDetails: senderDetails
        ? [{ bio: senderDetails.bio, rating: senderDetails.rating }]
        : null,
    },
  };

  return NextResponse.json({ message }, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const chatId = params.id;

  console.log("GET /api/chats/[id]/messages called with chatId:", chatId);

  // Validate chatId
  if (!chatId || chatId === "undefined") {
    console.error("Invalid chatId: chatId is undefined or invalid");
    return NextResponse.json(
      { error: "Invalid or missing chatId" },
      { status: 400 }
    );
  }

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

  // Verify chat exists and user is part of it
  const { data: chatData, error: chatError } = await (await supabase)
    .from("chat")
    .select("chat_id, user_id, tailor_id")
    .eq("chat_id", chatId)
    .single();

  if (chatError || !chatData) {
    console.error(
      "Failed to fetch chat:",
      chatError?.message || "Chat not found"
    );
    return NextResponse.json(
      { error: chatError?.message || "Chat not found" },
      { status: 404 }
    );
  }

  if (chatData.user_id !== authUser.id && chatData.tailor_id !== authUser.id) {
    console.error("Access forbidden: User not part of chat", {
      userId: authUser.id,
      chatId,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch messages
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
      created_at
      `
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .returns<SupabaseMessage[]>();

  if (messagesError) {
    console.warn(
      "Failed to fetch messages, proceeding with empty messages:",
      messagesError.message
    );
  }

  // Fetch sender data for all messages
  const senderIds = messagesData
    ? [...new Set(messagesData.map((msg: SupabaseMessage) => msg.sender_id))]
    : [];
  let sendersData: SupabaseUser[] = [];
  if (senderIds.length > 0) {
    const { data, error: sendersError } = await (
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
      .in("user_id", senderIds)
      .returns<SupabaseUser[]>();

    if (sendersError || !data) {
      console.error(
        "Failed to fetch senders:",
        sendersError?.message || "No sender data retrieved"
      );
      return NextResponse.json(
        { error: sendersError?.message || "Failed to fetch senders" },
        { status: 500 }
      );
    }
    sendersData = data;
  }

  // Fetch tailordetails for senders with role 'tailor'
  const senderTailorIds = sendersData
    .filter((user) => user.role === "tailor")
    .map((user) => user.user_id);
  let sendersTailorDetails: {
    user_id: string;
    bio: string | null;
    rating: number;
  }[] = [];
  if (senderTailorIds.length > 0) {
    const { data, error: sendersTailorError } = await (await supabase)
      .from("tailordetails")
      .select("user_id, bio, rating")
      .in("user_id", senderTailorIds);

    if (sendersTailorError) {
      console.warn(
        "Sender tailordetails not found, proceeding without:",
        sendersTailorError.message
      );
    } else {
      sendersTailorDetails = data || [];
    }
  }

  // Map senders to a dictionary for quick lookup
  const sendersMap = new Map(
    sendersData.map((sender) => [
      sender.user_id,
      {
        ...sender,
        TailorDetails:
          sendersTailorDetails
            .filter((td) => td.user_id === sender.user_id)
            .map((td) => ({ bio: td.bio, rating: td.rating })) || null,
      },
    ])
  );

  const messages: Message[] = messagesData
    ? messagesData.map((msg) => ({
        message_id: msg.message_id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        content: msg.content,
        translated_content: msg.translated_content
          ? JSON.parse(msg.translated_content)
          : null,
        language: msg.language,
        created_at: msg.created_at,
        sender: sendersMap.get(msg.sender_id) || ({} as User),
      }))
    : [];

  return NextResponse.json({ messages }, { status: 200 });
}
