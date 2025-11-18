// app/api/tailors/[tailorId]/all-designs/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Raw shape returned by Supabase
type RawDesignFromDB = {
  design_id: string;
  description: string | null;
  original_image_url: string;
  created_at: string | null;
  designtags:
    | {
        tag_id: number;
        tags: {
          tag_id: number;
          name: string;
        } | null;
      }[]
    | null;
};

// Clean shape sent to frontend
export type TailorDesign = {
  id: string;
  name: string;
  image: string;
  tags: string[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ← fixed param name
) {
  const { id } = await params;
  const supabase = createClient();

  // Auth check - ensure the requesting user is the tailor
  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !user || user.id !== id) {
    console.log(user);
    console.log(id);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Correct query using proper relationship syntax
  const { data: designs, error } = await (
    await supabase
  )
    .from("designs")
    .select(
      `
      design_id,
      description,
      original_image_url,
      created_at,
      designtags (
        tag_id,
        tags (
          tag_id,
          name
        )
      )
    `
    )
    .eq("tailor_id", id)
    .order("created_at", { ascending: false })
    .returns<RawDesignFromDB[]>();

  if (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to clean format with full type safety
  const formattedDesigns: TailorDesign[] = (designs ?? []).map((design) => ({
    id: design.design_id,
    name: design.description?.trim() || "Untitled Design",
    image: design.original_image_url,
    tags:
      design.designtags
        ?.map((join) => join.tags?.name)
        .filter((name): name is string => typeof name === "string") ?? [],
  }));

  return NextResponse.json({ designs: formattedDesigns });
}
