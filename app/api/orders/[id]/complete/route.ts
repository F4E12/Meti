// /app/api/orders/[order_id]/complete/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { order_id: string } }
) {
  const supabase = await createClient();
  const order_id = params.order_id;

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

  // Verify user is a tailor
  const { data: userData, error: userError } = await (await supabase)
    .from("users")
    .select("role")
    .eq("user_id", authUser.id)
    .eq("role", "tailor")
    .single();

  if (userError || !userData) {
    return NextResponse.json(
      { error: userError?.message || "Only tailors can complete orders" },
      { status: 403 }
    );
  }

  // Fetch order
  const { data: orderData, error: orderError } = await (await supabase)
    .from("orders")
    .select("order_id, tailor_id, status, user_id")
    .eq("order_id", order_id)
    .eq("tailor_id", authUser.id)
    .single();

  if (orderError || !orderData) {
    return NextResponse.json(
      { error: orderError?.message || "Order not found or unauthorized" },
      { status: 404 }
    );
  }

  // Check if order is in_progress
  if (orderData.status !== "in_progress") {
    return NextResponse.json(
      { error: "Only in-progress orders can be completed" },
      { status: 400 }
    );
  }

  // Update order status to completed
  const { data: updatedOrder, error: updateError } = await (await supabase)
    .from("orders")
    .update({ status: "completed" })
    .eq("order_id", order_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Notify customer via Messages
  const { data: chatData, error: chatError } = await (await supabase)
    .from("chat")
    .select("chat_id")
    .eq("user_id", orderData.user_id)
    .eq("tailor_id", authUser.id)
    .single();

  let chat_id = chatData?.chat_id;
  if (!chatData && !chatError) {
    const { data: newChat, error: newChatError } = await (await supabase)
      .from("chat")
      .insert({ user_id: orderData.user_id, tailor_id: authUser.id })
      .select()
      .single();
    if (newChatError) {
      console.error("Failed to create chat:", newChatError.message);
    } else {
      chat_id = newChat.chat_id;
    }
  }

  if (chat_id) {
    const { error: messageError } = await (await supabase)
      .from("messages")
      .insert({
        chat_id,
        sender_id: authUser.id,
        content: `Order ${order_id} has been completed.`,
        language: "en",
      });

    if (messageError) {
      console.error("Failed to send completion message:", messageError.message);
    }
  }

  return NextResponse.json({ order: updatedOrder });
}
