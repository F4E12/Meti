import { config } from "dotenv";
import { createSeedClient } from "./supabase/seedClient";
import { v4 as uuidv4 } from "uuid";

// Load environment variables from .env file
config();

// Log environment variables for debugging
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);

(async () => {
  const supabase = createSeedClient();

  try {
    // Seed Auth Users and Users table
    const users = [
      {
        email: "davidchr71@gmail.com",
        password: "password123",
        username: "customer1",
        role: "customer",
        full_name: "John Customer",
        location: "Jakarta",
        dialect: "Indonesian",
        right_arm_length: 60.5,
        shoulder_width: 45.0,
        left_arm_length: 60.0,
        upper_body_height: 70.0,
        hip_width: 40.0,
      },
      {
        email: "linegr0901@gmail.com",
        password: "password123",
        username: "tailor1",
        role: "tailor",
        full_name: "Jane Tailor",
        location: "Surabaya",
        dialect: "Javanese",
        right_arm_length: 58.0,
        shoulder_width: 43.0,
        left_arm_length: 57.5,
        upper_body_height: 68.0,
        hip_width: 38.0,
      },
    ];

    const userIds = new Map<string, string>();
    for (const user of users) {
      // Sign up user to Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            location: user.location,
            dialect: user.dialect,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (userId) {
        userIds.set(user.email, userId);
        // Insert into Users table
        const { error: usersError } = await supabase.from("Users").insert({
          user_id: userId,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          location: user.location,
          dialect: user.dialect,
          right_arm_length: user.right_arm_length,
          shoulder_width: user.shoulder_width,
          left_arm_length: user.left_arm_length,
          upper_body_height: user.upper_body_height,
          hip_width: user.hip_width,
        });

        if (usersError) throw usersError;
      }
    }

    // Seed Tailors table
    const { error: tailorsError } = await supabase.from("Tailors").insert([
      {
        tailor_id: uuidv4(),
        user_id: userIds.get("linegr0901@gmail.com"),
        bio: "Experienced tailor with 10 years of expertise.",
        portfolio: { projects: ["dress1", "suit1"] },
        rating: 4.5,
      },
    ]);
    if (tailorsError) throw tailorsError;

    // Seed Tags table
    const { error: tagsError } = await supabase
      .from("Tags")
      .insert([
        { name: "casual" },
        { name: "formal" },
        { name: "traditional" },
      ]);
    if (tagsError) throw tagsError;

    // Seed Designs table
    const { error: designsError } = await supabase.from("Designs").insert([
      {
        design_id: uuidv4(),
        tailor_id: userIds.get("linegr0901@gmail.com"),
        description: "Elegant casual dress",
      },
    ]);
    if (designsError) throw designsError;

    // Seed DesignTags table
    const design = await supabase
      .from("Designs")
      .select("design_id")
      .eq("description", "Elegant casual dress")
      .single();
    const { error: designTagsError } = await supabase
      .from("DesignTags")
      .insert([
        {
          design_id: design.data?.design_id,
          tag_id: 1, // casual
        },
      ]);
    if (designTagsError) throw designTagsError;

    // Seed UserDesigns table
    const { error: userDesignsError } = await supabase
      .from("UserDesigns")
      .insert([
        {
          user_design_id: uuidv4(),
          user_id: userIds.get("davidchr71@gmail.com"),
          design_id: design.data?.design_id,
        },
      ]);
    if (userDesignsError) throw userDesignsError;

    // Seed Orders table
    const { error: ordersError } = await supabase.from("Orders").insert([
      {
        order_id: uuidv4(),
        user_id: userIds.get("davidchr71@gmail.com"),
        tailor_id: userIds.get("linegr0901@gmail.com"),
        status: "pending",
        delivery_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ]);
    if (ordersError) throw ordersError;

    // Seed Chat table
    const { error: chatError } = await supabase.from("Chat").insert([
      {
        chat_id: uuidv4(),
        user_id: userIds.get("davidchr71@gmail.com"),
        tailor_id: userIds.get("linegr0901@gmail.com"),
      },
    ]);
    if (chatError) throw chatError;

    // Seed Messages table
    const chat = await supabase
      .from("Chat")
      .select("chat_id")
      .eq("user_id", userIds.get("davidchr71@gmail.com"))
      .single();
    const { error: messagesError } = await supabase.from("Messages").insert([
      {
        message_id: uuidv4(),
        chat_id: chat.data?.chat_id,
        sender_id: userIds.get("davidchr71@gmail.com"),
        content: "Hello, can you tailor this design for me?",
        translated_content: { en: "Hello, can you tailor this design for me?" },
        language: "en",
      },
    ]);
    if (messagesError) throw messagesError;

    // Seed Wishlist table
    const { error: wishlistError } = await supabase.from("Wishlist").insert([
      {
        wishlist_id: uuidv4(),
        user_id: userIds.get("davidchr71@gmail.com"),
        design_id: design.data?.design_id,
      },
    ]);
    if (wishlistError) throw wishlistError;

    console.log("Data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
  }
})();
