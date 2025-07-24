import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { User } from "@/lib/model/user";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 401 }
    );
  }

  const customUser: User = {
    uid: user.id,
    email: user.email ?? "",
    phone: user.phone ?? undefined,
    user_metadata: user.user_metadata,
    created_at: user.created_at,
  };

  return NextResponse.json({ user: customUser });
}
