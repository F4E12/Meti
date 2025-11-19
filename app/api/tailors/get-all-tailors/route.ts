import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: tailors, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "tailor");

  if (error) {
    console.error("Error fetching tailors:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error: Could not fetch tailors." },
      { status: 500 }
    );
  }

  // 4. Return the list of tailors
  return NextResponse.json({ tailors });
}
