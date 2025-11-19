import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

/**
 * Handles GET requests to fetch the original image URL for a specific design.
 * Access path: /api/designs/get-img-url/[id]
 * @param request The incoming Next.js Request object.
 * @param params The dynamic route parameters, expecting { id: string }.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const designId = (await params).id;

  
  if (!designId) {
    return NextResponse.json(
      { error: "Design ID is required" },
      { status: 400 }
    );
  }

  // 1. Initialize Supabase client
  const supabase = await createClient();

  // 2. Get authenticated user (Security check)
  // const {
  //   data: { user: authUser },
  //   error: authError,
  // } = await supabase.auth.getUser();

  // if (authError || !authUser) {
  //   return NextResponse.json(
  //     { error: authError?.message || "Unauthorized" },
  //     { status: 401 }
  //   );
  // }

  // 3. Query the 'designs' table
  // NOTE: We assume the 'designs' table has a 'user_id' column for ownership checking.
  const { data: designData, error: dbError } = await supabase
    .from("designs")
    .select("original_image_url")
    .eq("design_id", designId) // Match the design ID
    .single();

  // 4. Handle database errors
  if (dbError) {
    // If the error is 'not found' (meaning single() returned null), treat as 404
    if (dbError.code === "PGRST116") {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    console.error("Database error fetching design:", dbError.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  // 5. Handle design not found (though covered by dbError check, this is cleaner)
  if (!designData) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }
  
  // 6. Return the URL
  return NextResponse.json({ 
    design_id: designId,
    original_image_url: designData.original_image_url 
  });
}