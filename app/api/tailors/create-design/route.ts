import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";

// app/api/tailors/create-design/route.ts
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { name, imageUrl, tags } = await req.json();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!name || !imageUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const id = uuidv4();

  const { data, error } = await (
    await supabase
  )
    .from("designs")
    .insert({
      design_id: id,
      tailor_id: user.id,
      original_image_url: imageUrl,
      description: name,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert tags
  if (tags?.length > 0) {
    await (await supabase)
      .from("design_tags")
      .insert(tags.map((tag_id: number) => ({ design_id: id, tag_id })));
  }

  return NextResponse.json({ data }, { status: 200 });
}
