// app/api/designs/get-all/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface DesignSummary {
  design_id: string;
  original_image_url: string;
  description: string | null;
  created_at: string | null;
  tags: { tag_id: number; name: string }[];
}

interface PaginatedResponse {
  designs: DesignSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

type DesignsWithTagsRow = {
  design_id: string;
  original_image_url: string;
  description: string | null;
  created_at: string | null;
  designtags:
    | {
        tags: {
          tag_id: number;
          name: string;
        };
      }[]
    | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createClient();

  // Optional: keep auth if you want logged-in experience
  // Remove or make optional if you want fully public access
  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  // if (authError || !user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const [{ count }, { data: designs, error }] = await Promise.all([
    // Count ALL designs (no tailor_id filter)
    (await supabase)
      .from("designs")
      .select("*", { count: "exact", head: true }),

    // Fetch ALL designs with tags (no tailor_id filter)
    (
      await supabase
    )
      .from("designs")
      .select(
        `
        design_id,
        original_image_url,
        description,
        created_at,
        designtags!left (
          tags!inner (
            tag_id,
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(from, to)
      .returns<DesignsWithTagsRow[]>(),
  ]);

  if (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedDesigns: DesignSummary[] = (designs ?? []).map((design) => ({
    design_id: design.design_id,
    original_image_url: design.original_image_url,
    description: design.description,
    created_at: design.created_at,
    tags: (design.designtags ?? []).map((dt) => ({
      tag_id: dt.tags.tag_id,
      name: dt.tags.name,
    })),
  }));

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const response: PaginatedResponse = {
    designs: formattedDesigns,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };

  return NextResponse.json(response);
}
