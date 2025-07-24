"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, ArrowLeft, MessageCircle } from "lucide-react";
import Header from "@/components/headers/header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Chat } from "@/lib/model/chat";
import { Message } from "@/lib/model/message";
import { User } from "@/lib/model/user";

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
  TailorDetails: { bio: string | null; rating: number } | null;
}

interface SupabaseMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: string | null;
  language: string | null;
  created_at: string;
  sender: SupabaseUser | null;
}

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = useParams();
  const [role, setRole] = useState<"guest" | "customer" | "tailor" | "loading">(
    "loading"
  );
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          setRole("guest");
          setIsLoading(false);
          return;
        }
        const data: { user: User } = await res.json();
        setRole(data.user.role);
        return data.user.role;
      } catch (error) {
        console.error("Error fetching user:", error);
        setRole("guest");
        setIsLoading(false);
      }
    };

    const fetchChat = async () => {
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) throw new Error("Failed fetching chat");
      const data = await res.json();
      setChat(data.chat);
      setMessages(data.messages);
      setIsLoading(false);
    };

    const init = async () => {
      const role = await fetchUser();
      if (role === "customer" || role === "tailor") {
        await fetchChat();
      } else {
        router.push("/");
      }
    };

    init();
  }, [router, chatId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (role !== "customer" && role !== "tailor") return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("Messages")
            .select(
              `
              message_id,
              chat_id,
              sender_id,
              content,
              translated_content,
              language,
              created_at,
              sender:Users!sender_id (
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
                created_at,
                TailorDetails (bio, rating)
              )
              `
            )
            .eq("message_id", payload.new.message_id)
            .single()
            .returns<SupabaseMessage>();

          if (error || !data) {
            console.error("Error fetching new message:", error?.message);
            return;
          }

          const newMessage: Message = {
            message_id: data.message_id,
            chat_id: data.chat_id,
            sender_id: data.sender_id,
            content: data.content,
            translated_content: data.translated_content
              ? JSON.parse(data.translated_content)
              : null,
            language: data.language,
            created_at: data.created_at,
            sender: data.sender
              ? {
                  ...data.sender,
                  TailorDetails: data.sender.TailorDetails
                    ? [data.sender.TailorDetails]
                    : null,
                }
              : ({} as User),
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, supabase, chatId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, language: null }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isLoading && role !== "customer" && role !== "tailor") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/chat">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold">
              {chat
                ? role === "customer"
                  ? chat.tailor.full_name || chat.tailor.username
                  : chat.customer.full_name || chat.customer.username
                : "Loading..."}
            </h1>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">
                No messages yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start the conversation with your tailor!
              </p>
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="max-h-[60vh] overflow-y-auto mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`flex ${
                        message.sender_id === chat?.user_id &&
                        role === "customer"
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-lg ${
                          message.sender_id === chat?.user_id &&
                          role === "customer"
                            ? "bg-gradient-teal-pink text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 h-12 border-border/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-teal-pink hover:opacity-90 text-white rounded-xl"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
