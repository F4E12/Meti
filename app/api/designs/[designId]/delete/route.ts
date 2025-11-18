// app/api/designs/[designId]/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  const { designId } = await params;
  const supabase = createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the design belongs to the user
  const { data: design, error: fetchError } = await (await supabase)
    .from("designs")
    .select("tailor_id, original_image_url")
    .eq("design_id", designId)
    .single();

  console.log("fetchError: ", fetchError);

  if (fetchError || !design) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  if (design.tailor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Optional: Delete image from storage (extract path from URL)
  try {
    const imagePath = design.original_image_url.split(
      "/storage/v1/object/public/meti.storage/"
    )[1];
    if (imagePath) {
      await (await supabase).storage.from("meti.storage").remove([imagePath]);
    }
  } catch (storageError) {
    console.warn("Could not delete image from storage:", storageError);
    // Continue anyway – design record is more important
  }

  // Delete design (cascades to designtags thanks to FK constraints)
  const { error } = await (await supabase)
    .from("designs")
    .delete()
    .eq("design_id", designId);

  if (error) {
    console.error("Error deleting design:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
