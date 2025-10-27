import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const {id} = await params;
  const supabase = createClient();
  const tailorId = id;

  const { count, error } = await (await supabase)
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .eq("tailor_id", tailorId);

  if (error) {
    return NextResponse.json({ completedCount: 0 }, { status: 200 });
  }

  return NextResponse.json({ completedCount: count }, { status: 200 });
}
