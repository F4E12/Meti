import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
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

  // Fetch order
  const { data: orderData, error: orderError } = await (await supabase)
    .from("orders")
    .select("order_id, user_id, tailor_id, status, order_date")
    .eq("order_id", order_id)
    .or(`user_id.eq.${authUser.id},tailor_id.eq.${authUser.id}`)
    .single();

  if (orderError || !orderData) {
    return NextResponse.json(
      { error: orderError?.message || "Order not found or unauthorized" },
      { status: 404 }
    );
  }

  // Check 24-hour cancellation limit
  const orderDate = new Date(orderData.order_date);
  const currentTime = new Date();
  const hoursDiff =
    (currentTime.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    return NextResponse.json(
      { error: "Order cannot be cancelled after 24 hours" },
      { status: 400 }
    );
  }

  // Update order status to cancelled
  const { data: updatedOrder, error: updateError } = await (await supabase)
    .from("orders")
    .update({ status: "cancelled" })
    .eq("order_id", order_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ order: updatedOrder });
}
