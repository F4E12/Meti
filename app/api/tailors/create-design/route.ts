import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  const {
    data: { user: authUser },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !authUser) {
    console.error(
      "Authentication failed:",
      authError?.message || "No user found"
    );
    return NextResponse.json(
      { error: authError?.message || "Unauthorized access" },
      { status: 401 }
    );
  }

  const user_id = authUser.id;

  const { name, image, extractedDesign, tags } = body;

  if (!name || !(image || extractedDesign)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const finalImage = extractedDesign || image;

if (typeof finalImage !== 'string') {
  return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
}

const base64Data = finalImage.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await (await supabase).storage
    .from('designs')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 2. Get public URL
  const {
    data: { publicUrl },
  } = (await supabase).storage.from('designs').getPublicUrl(fileName);

  // 3. Insert to `designs` table
  const id = uuidv4();
  const { data: designData, error: insertError } = await (await supabase)
    .from('designs')
    .insert([
      {
        design_id: id,
        tailor_id: user_id,
        original_image_url: publicUrl,
        description: name,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 4. Insert tags
  if (Array.isArray(tags) && tags.length > 0) {
    const tagInserts = tags.map((tag_id: number) => ({
      design_id: id,
      tag_id,
    }));

    const { error: tagInsertError } = await (await supabase)
      .from('design_tags')
      .insert(tagInserts);

    if (tagInsertError) {
      return NextResponse.json({ error: tagInsertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ data: designData }, { status: 200 });
}
