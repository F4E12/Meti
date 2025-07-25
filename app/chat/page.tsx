"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle } from "lucide-react";
import Header from "@/components/headers/header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Chat } from "@/lib/model/chat";
import { User } from "@/lib/model/user";
import Image from "next/image";

// Define the expected shape of the Supabase response
interface SupabaseUser {
  user_id: string;
  username: string;
  email: string;
  role: "customer" | "tailor";
  full_name: string | null;
  location: string | null;
  dialect: string | null;
  profile_picture_url: string;
  right_arm_length: number | null;
  shoulder_width: number | null;
  left_arm_length: number | null;
  upper_body_height: number | null;
  hip_width: number | null;
  created_at: string;
  TailorDetails: { bio: string | null; rating: number }[] | null;
}

interface SupabaseChat {
  chat_id: string;
  user_id: string;
  tailor_id: string;
  created_at: string;
  customer: SupabaseUser | null;
  tailor: SupabaseUser | null;
}

export default function ChatListPage() {
  const router = useRouter();
  const [role, setRole] = useState<"guest" | "customer" | "tailor" | "loading">(
    "loading"
  );
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          console.error("Failed to fetch user:", res.statusText);
          setRole("guest");
          setIsLoading(false);
          return null;
        }
        const data: { user: User } = await res.json();
        setRole(data.user.role);
        return data.user.role;
      } catch (error) {
        console.error("Error fetching user:", error);
        setRole("guest");
        setIsLoading(false);
        return null;
      }
    };

    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chats");
        if (!res.ok) {
          throw new Error(`Failed fetching chats: ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Fetched chats data:", data.chats); // Log the response data
        setChats(data.chats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setIsLoading(false);
      }
    };

    const init = async () => {
      const userRole = await fetchUser();
      if (userRole === "customer" || userRole === "tailor") {
        await fetchChats();
      } else {
        router.push("/");
      }
    };

    init();
  }, [router]);

  // Real-time subscription for new chats
  useEffect(() => {
    if (role !== "customer" && role !== "tailor") return;

    const fetchUserId = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.error(
          "Failed to fetch user ID for subscription:",
          error?.message
        );
        return null;
      }
      return user.id;
    };

    fetchUserId().then((userId) => {
      if (!userId) return;

      const channel = supabase
        .channel("chats")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat",
            filter: `user_id=eq.${userId},tailor_id=eq.${userId}`,
          },
          async (payload) => {
            // Fetch chat details
            const { data: chatData, error: chatError } = await supabase
              .from("chat")
              .select(
                `
                chat_id,
                user_id,
                tailor_id,
                created_at
                `
              )
              .eq("chat_id", payload.new.chat_id)
              .single()
              .returns<SupabaseChat>();

            if (chatError || !chatData) {
              console.error("Error fetching new chat:", chatError?.message);
              return;
            }

            // Fetch customer data
            const { data: customerData, error: customerError } = await supabase
              .from("users")
              .select(
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
              .eq("user_id", chatData.user_id)
              .single()
              .returns<SupabaseUser>();

            if (customerError || !customerData) {
              console.error(
                "Error fetching customer for new chat:",
                customerError?.message
              );
              return;
            }

            // Fetch customer TailorDetails
            const { data: customerDetails, error: customerDetailsError } =
              await supabase
                .from("tailordetails")
                .select("bio, rating")
                .eq("user_id", chatData.user_id)
                .single();

            if (customerDetailsError) {
              console.warn(
                "Customer TailorDetails not found for new chat:",
                customerDetailsError.message
              );
            }

            // Fetch tailor data
            const { data: tailorData, error: tailorError } = await supabase
              .from("users")
              .select(
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
              .eq("user_id", chatData.tailor_id)
              .single()
              .returns<SupabaseUser>();

            if (tailorError || !tailorData) {
              console.error(
                "Error fetching tailor for new chat:",
                tailorError?.message
              );
              return;
            }

            // Fetch tailor TailorDetails
            const { data: tailorDetails, error: tailorDetailsError } =
              await supabase
                .from("tailordetails")
                .select("bio, rating")
                .eq("user_id", chatData.tailor_id)
                .single();

            if (tailorDetailsError) {
              console.warn(
                "Tailor TailorDetails not found for new chat:",
                tailorDetailsError.message
              );
            }

            const newChat: Chat = {
              chat_id: chatData.chat_id,
              user_id: chatData.user_id,
              tailor_id: chatData.tailor_id,
              created_at: chatData.created_at,
              customer: {
                ...customerData,
                TailorDetails: customerDetails
                  ? [
                      {
                        bio: customerDetails.bio,
                        rating: customerDetails.rating,
                      },
                    ]
                  : null,
              },
              tailor: {
                ...tailorData,
                TailorDetails: tailorDetails
                  ? [{ bio: tailorDetails.bio, rating: tailorDetails.rating }]
                  : null,
              },
            };

            setChats((prev) => [newChat, ...prev]);
            console.log("New chat added via subscription:", newChat);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [role, supabase]);

  if (!isLoading && role !== "customer" && role !== "tailor") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">
            Your Chats
          </h1>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading your chats...</p>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">
                No chats yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start a conversation with one of our master tailors
              </p>
              <Link href="/tailors">
                <Button className="bg-gradient-teal-pink hover:opacity-90 text-white rounded-xl">
                  Find Tailors
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Link key={chat.chat_id} href={`/chat/${chat.chat_id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-background/80 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                        <Image
                          src={
                            role === "customer"
                              ? chat.tailor.profile_picture_url ||
                                "/placeholder.svg?height=48&width=48"
                              : chat.customer.profile_picture_url ||
                                "/placeholder.svg?height=48&width=48"
                          }
                          alt={
                            role === "customer"
                              ? chat.tailor.full_name || chat.tailor.username
                              : chat.customer.full_name ||
                                chat.customer.username
                          }
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-serif font-semibold">
                          {role === "customer"
                            ? chat.tailor.full_name || chat.tailor.username
                            : chat.customer.full_name || chat.customer.username}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {chat.last_message?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chat.last_message
                          ? new Date(
                              chat.last_message.created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(chat.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
