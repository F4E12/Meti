// app/api/tailors/create-design/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { name, imageUrl, tags } = await req.json();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name || !imageUrl) {
    return NextResponse.json(
      { error: "Name and image URL are required" },
      { status: 400 }
    );
  }

  const designId = uuidv4();

  // Insert the design
  const { data: design, error: designError } = await (
    await supabase
  )
    .from("designs")
    .insert({
      design_id: designId,
      tailor_id: user.id,
      original_image_url: imageUrl,
      description: name,
    })
    .select()
    .single();

  if (designError) {
    console.error("Design insert error:", designError);
    return NextResponse.json({ error: designError.message }, { status: 500 });
  }

  // Insert into designtags (correct table name!)
  if (Array.isArray(tags) && tags.length > 0) {
    const tagInserts = tags.map((tag_id: number) => ({
      design_id: designId,
      tag_id,
    }));

    const { error: tagError } = await (
      await supabase
    )
      .from("designtags") // ← Fixed: was "design_tags"
      .insert(tagInserts);

    if (tagError) {
      console.error("Failed to insert tags:", tagError);
      // Don't fail the whole request — design is already created
    }
  }

  return NextResponse.json({ data: design }, { status: 200 });
}
