// app/api/designs/[designId]/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface DesignWithTags {
  design_id: string;
  tailor_id: string | null;
  original_image_url: string;
  description: string | null;
  created_at: string | null;
  tags: { tag_id: number; name: string }[];
}

// Type for the tags join row
type DesignTagRow = {
  tags: {
    tag_id: number;
    name: string;
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  const { designId } = await params;
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [designRes, tagsRes] = await Promise.all([
    (await supabase)
      .from("designs")
      .select(
        "design_id, tailor_id, original_image_url, description, created_at"
      )
      .eq("design_id", designId)
      .single(),

    (await supabase)
      .from("designtags")
      .select("tags!inner(tag_id, name)")
      .eq("design_id", designId),
  ]);

  if (designRes.error || !designRes.data) {
    return NextResponse.json(
      { error: designRes.error?.message || "Design not found" },
      { status: 404 }
    );
  }

  const design = designRes.data as {
    design_id: string;
    tailor_id: string | null;
    original_image_url: string;
    description: string | null;
    created_at: string | null;
  };

  if (design.tailor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fully typed — no `any`
  const tags = ((tagsRes.data as DesignTagRow[] | null) ?? []).map((row) => ({
    tag_id: row.tags.tag_id,
    name: row.tags.name,
  }));

  const response: DesignWithTags = {
    ...design,
    tags,
  };

  return NextResponse.json(response);
}
