import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const tailorId = params.id;

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
