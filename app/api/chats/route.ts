import { Chat } from "@/lib/model/chat";
import { User } from "@/lib/model/user";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Define the expected shape of the Supabase response for type safety
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
}

interface SupabaseTailorDetails {
  user_id: string;
  bio: string | null;
  rating: number;
  created_at: string;
}

interface SupabaseChat {
  chat_id: string;
  user_id: string;
  tailor_id: string;
  created_at: string;
}

interface SupabaseMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: Record<string, string> | null;
  language: string | null;
  created_at: string;
}

export async function GET() {
  const supabase = createClient();

  // Authenticate user
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

  // Step 1: Fetch chats where the user is either customer or tailor
  const { data: chatsData, error: chatsError } = await (await supabase)
    .from("chat")
    .select("chat_id, user_id, tailor_id, created_at")
    .or(`user_id.eq.${authUser.id},tailor_id.eq.${authUser.id}`)
    .order("created_at", { ascending: false })
    .returns<SupabaseChat[]>();

  if (chatsError || !chatsData) {
    console.error("Error fetching chats:", chatsError?.message);
    return NextResponse.json(
      { error: chatsError?.message || "Failed to fetch chats" },
      { status: 500 }
    );
  }

  // If no chats, return empty array
  if (chatsData.length === 0) {
    return NextResponse.json({ chats: [] });
  }

  // Step 2: Fetch user details for all customer and tailor IDs
  const userIds = Array.from(
    new Set(chatsData.flatMap((chat) => [chat.user_id, chat.tailor_id]))
  );

  const { data: usersData, error: usersError } = await (
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
    .in("user_id", userIds)
    .returns<SupabaseUser[]>();

  if (usersError || !usersData) {
    console.error("Error fetching users:", usersError?.message);
    return NextResponse.json(
      { error: usersError?.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }

  // Step 3: Fetch TailorDetails for users with role 'tailor'
  const tailorIds = usersData
    .filter((user) => user.role === "tailor")
    .map((user) => user.user_id);

  let tailorDetailsData: SupabaseTailorDetails[] = [];
  if (tailorIds.length > 0) {
    const { data, error: tailorDetailsError } = await (await supabase)
      .from("TailorDetails")
      .select("user_id, bio, rating, created_at")
      .in("user_id", tailorIds)
      .returns<SupabaseTailorDetails[]>();

    if (tailorDetailsError || !data) {
      console.error(
        "Error fetching tailor details:",
        tailorDetailsError?.message
      );
      return NextResponse.json(
        {
          error:
            tailorDetailsError?.message || "Failed to fetch tailor details",
        },
        { status: 500 }
      );
    }
    tailorDetailsData = data;
  }

  // Step 4: Fetch the latest message for each chat
  const chatIds = chatsData.map((chat) => chat.chat_id);
  const { data: messagesData, error: messagesError } = await (await supabase)
    .from("Messages")
    .select(
      "message_id, chat_id, sender_id, content, translated_content, language, created_at"
    )
    .in("chat_id", chatIds)
    .order("created_at", { ascending: false })
    .limit(1, { foreignTable: "chat_id" })
    .returns<SupabaseMessage[]>();

  if (messagesError) {
    console.error("Error fetching messages:", messagesError?.message);
    return NextResponse.json(
      { error: messagesError?.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }

  // Step 5: Combine data into Chat interface
  const chats: Chat[] = chatsData.map((chat) => {
    const customer = usersData.find((user) => user.user_id === chat.user_id);
    const tailor = usersData.find((user) => user.user_id === chat.tailor_id);
    const tailorDetails = tailorDetailsData.find(
      (details) => details.user_id === chat.tailor_id
    );
    const lastMessage = messagesData.find(
      (msg) => msg.chat_id === chat.chat_id
    );

    return {
      chat_id: chat.chat_id,
      user_id: chat.user_id,
      tailor_id: chat.tailor_id,
      created_at: chat.created_at,
      customer: customer
        ? {
            ...customer,
            TailorDetails:
              customer.role === "tailor"
                ? tailorDetailsData
                    .filter((td) => td.user_id === customer.user_id)
                    .map((td) => ({ bio: td.bio, rating: td.rating }))
                : null,
          }
        : ({} as User),
      tailor: tailor
        ? {
            ...tailor,
            TailorDetails: tailorDetails
              ? [{ bio: tailorDetails.bio, rating: tailorDetails.rating }]
              : null,
          }
        : ({} as User),
      last_message: lastMessage
        ? {
            message_id: lastMessage.message_id,
            chat_id: lastMessage.chat_id,
            sender_id: lastMessage.sender_id,
            content: lastMessage.content,
            translated_content: lastMessage.translated_content,
            language: lastMessage.language,
            created_at: lastMessage.created_at,
            sender: (() => {
              const senderUser = usersData.find(
                (user) => user.user_id === lastMessage.sender_id
              );
              if (!senderUser) return {} as User;
              const senderTailorDetails = tailorDetailsData.find(
                (td) => td.user_id === senderUser.user_id
              );
              return {
                ...senderUser,
                TailorDetails:
                  senderUser.role === "tailor" && senderTailorDetails
                    ? [
                        {
                          bio: senderTailorDetails.bio,
                          rating: senderTailorDetails.rating,
                        },
                      ]
                    : null,
              };
            })(),
          }
        : undefined,
    };
  });

  return NextResponse.json({ chats });
}

export async function POST(request: Request) {
  const supabase = createClient();

  // Authenticate user
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
      created_at
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

  // Fetch TailorDetails for the tailor
  const { data: tailorDetailsData, error: tailorDetailsError } = await (
    await supabase
  )
    .from("TailorDetails")
    .select("bio, rating")
    .eq("user_id", tailorId)
    .single()
    .returns<SupabaseTailorDetails>();

  if (tailorDetailsError && tailorDetailsError.code !== "PGRST116") {
    console.error(
      "Error fetching tailor details:",
      tailorDetailsError?.message
    );
    return NextResponse.json(
      {
        error: tailorDetailsError?.message || "Failed to fetch tailor details",
      },
      { status: 500 }
    );
  }

  // Check if chat already exists
  const { data: existingChat, error: existingChatError } = await (
    await supabase
  )
    .from("chat")
    .select("chat_id")
    .eq("user_id", authUser.id)
    .eq("tailor_id", tailorId)
    .single();

  if (existingChat) {
    return NextResponse.json({ error: "Chat already exists" }, { status: 409 });
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
  const { data: newChatData, error: insertError } = await (
    await supabase
  )
    .from("chat")
    .insert({
      chat_id: chatId,
      user_id: authUser.id,
      tailor_id: tailorId,
      created_at: new Date().toISOString(),
    })
    .select("chat_id, user_id, tailor_id, created_at")
    .single()
    .returns<SupabaseChat>();

  if (insertError || !newChatData) {
    console.error("Error creating chat:", insertError?.message);
    return NextResponse.json(
      { error: insertError?.message || "Failed to create chat" },
      { status: 500 }
    );
  }

  // Fetch customer details
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
    .eq("user_id", authUser.id)
    .single()
    .returns<SupabaseUser>();

  if (customerError || !customerData) {
    console.error("Error fetching customer:", customerError?.message);
    return NextResponse.json(
      { error: customerError?.message || "Failed to fetch customer data" },
      { status: 500 }
    );
  }

  // Construct the Chat response
  const chat: Chat = {
    chat_id: newChatData.chat_id,
    user_id: newChatData.user_id,
    tailor_id: newChatData.tailor_id,
    created_at: newChatData.created_at,
    customer: {
      ...customerData,
      TailorDetails: null, // Customers don't have TailorDetails
    },
    tailor: {
      ...tailorData,
      TailorDetails: tailorDetailsData
        ? [{ bio: tailorDetailsData.bio, rating: tailorDetailsData.rating }]
        : null,
    },
  };

  return NextResponse.json({ chat }, { status: 201 });
}
