import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json(
      { error: authError?.message || "Unauthorized" },
      { status: 401 }
    );
  }

  // 2. Parse request body
  const body = await request.json();
//   console.log("Request body:", body);
  const {
    username,
    email,
    full_name,
    location,
    dialect,
    profile_picture_url,
    role, // Needed to determine if TailorDetails should be updated
    bio, // Tailor-specific field
    // Measurements (Added these fields for completeness, assuming they might be updated here)
    right_arm_length,
    shoulder_width,
    left_arm_length,
    upper_body_height,
    hip_width,
  } = body;

  // 3. Validate required fields
  if (!username || !email) {
    return NextResponse.json(
      { error: "Username and email are required" },
      { status: 400 }
    );
  }

  // 4. Prepare data for Users table update
  const userUpdateData: Record<string, unknown> = {
    username,
    email,
    full_name: full_name === undefined ? null : full_name,
    location: location === undefined ? null : location,
    dialect: dialect === undefined ? null : dialect,
    profile_picture_url: profile_picture_url || "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/no_pp.jpg",
    // Include measurement updates if provided in the request body
    ...(right_arm_length !== undefined && { right_arm_length }),
    ...(shoulder_width !== undefined && { shoulder_width }),
    ...(left_arm_length !== undefined && { left_arm_length }),
    ...(upper_body_height !== undefined && { upper_body_height }),
    ...(hip_width !== undefined && { hip_width }),
  };

  // 5. Update Users table
  const { data: userData, error: userError } = await (
    await supabase
  )
    .from("users")
    .update(userUpdateData)
    .eq("user_id", authUser.id)
    .select(
        // Select all fields relevant for the response
        `
          user_id,
          username,
          email,
          role,
          full_name,
          location,
          dialect,
          profile_picture_url,
          right_arm_length,
          shoulder_width,
          left_arm_length,
          upper_body_height,
          hip_width,
          created_at
        `
    )
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // 6. If user is a tailor and bio is present, update or insert TailorDetails
  let tailorDetails = null;
  // NOTE: Assuming the client sends the current user's role in the body, OR
  // using the role returned from the user update in step 5: userData.role
  const userRole = role || userData.role; 
  
  if (userRole === "tailor" && bio !== undefined) {
    const { data: existingTailor, error: fetchError } = await (await supabase)
      .from("tailordetails")
      .select("user_id")
      .eq("user_id", authUser.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows found"
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingTailor) {
      // Update existing TailorDetails
      const { data, error: updateError } = await (
        await supabase
      )
        .from("tailordetails")
        .update({ bio: bio || null })
        .eq("user_id", authUser.id)
        .select("bio, rating") // Select only relevant tailor detail fields
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
      tailorDetails = data;
    } else {
      // Insert new TailorDetails
      const { data, error: insertError } = await (
        await supabase
      )
        .from("tailordetails")
        .insert({ user_id: authUser.id, bio: bio || null })
        .select("bio, rating") // Select only relevant tailor detail fields
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
      tailorDetails = data;
    }
  }

  // 7. Return the updated user data
  return NextResponse.json({
    user: {
      ...userData,
      TailorDetails: tailorDetails ? [tailorDetails] : null,
    },
  });
}