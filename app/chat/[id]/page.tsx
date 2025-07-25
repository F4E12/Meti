"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Header from "@/components/headers/header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Chat } from "@/lib/model/chat";
import { Message } from "@/lib/model/message";
import { User } from "@/lib/model/user";

interface SupabaseMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content: string | null;
  language: string | null;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { id } = useParams();
  const [role, setRole] = useState<"guest" | "customer" | "tailor" | "loading">(
    "loading"
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Normalize chatId
  const chatId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          console.error("Failed to fetch user:", res.statusText);
          return null;
        }
        const data: { user: User } = await res.json();
        setRole(data.user.role);
        setCurrentUserId(data.user.user_id); // Store current user ID
        return data.user;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    };

    const fetchChat = async () => {
      try {
        console.log("Fetching chat with ID:", chatId);
        const res = await fetch(`/api/chats/${chatId}`);
        if (!res.ok) {
          throw new Error(`Failed fetching chat: ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Fetched chat data:", data);
        setChat(data.chat);
        setMessages(data.messages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chat:", error);
        setIsLoading(false);
        router.push("/chat");
      }
    };

    const init = async () => {
      if (!chatId || chatId === "undefined") {
        console.error("Invalid chatId: chatId is undefined or invalid");
        router.push("/chat");
        setIsLoading(false);
        return;
      }

      const user = await fetchUser();
      if (user && (user.role === "customer" || user.role === "tailor")) {
        await fetchChat();
      } else {
        router.push("/");
        setIsLoading(false);
      }
    };

    init();
  }, [router, chatId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (role !== "customer" && role !== "tailor") return;
    if (!chatId || chatId === "undefined") {
      console.warn("Skipping subscription due to invalid chatId");
      return;
    }

    console.log("Setting up Supabase subscription for chatId:", chatId);
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
          console.log("Received new message payload:", payload);
          const { data: messageData, error: messageError } = await supabase
            .from("Messages")
            .select(
              `
              message_id,
              chat_id,
              sender_id,
              content,
              translated_content,
              language,
              created_at
              `
            )
            .eq("message_id", payload.new.message_id)
            .single()
            .returns<SupabaseMessage>();

          if (messageError || !messageData) {
            console.error("Error fetching new message:", messageError?.message);
            return;
          }

          // Fetch sender data
          const { data: senderData, error: senderError } = await supabase
            .from("Users")
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
            .eq("user_id", messageData.sender_id)
            .single()
            .returns<User>();

          if (senderError || !senderData) {
            console.error(
              "Error fetching sender for new message:",
              senderError?.message
            );
            return;
          }

          // Fetch sender TailorDetails if sender is a tailor
          let senderDetails: { bio: string | null; rating: number } | null =
            null;
          if (senderData.role === "tailor") {
            const { data, error: senderDetailsError } = await supabase
              .from("TailorDetails")
              .select("bio, rating")
              .eq("user_id", messageData.sender_id)
              .single();

            if (senderDetailsError) {
              console.warn(
                "Sender TailorDetails not found for new message, proceeding without:",
                senderDetailsError.message
              );
            } else {
              senderDetails = data;
            }
          }

          const newMessage: Message = {
            message_id: messageData.message_id,
            chat_id: messageData.chat_id,
            sender_id: messageData.sender_id,
            content: messageData.content,
            translated_content: messageData.translated_content
              ? JSON.parse(messageData.translated_content)
              : null,
            language: messageData.language,
            created_at: messageData.created_at,
            sender: {
              ...senderData,
              TailorDetails: senderDetails
                ? [{ bio: senderDetails.bio, rating: senderDetails.rating }]
                : null,
            },
          };

          // Prevent duplicate messages by checking message_id
          setMessages((prev) =>
            prev.some((msg) => msg.message_id === newMessage.message_id)
              ? prev
              : [...prev, newMessage]
          );
          console.log("New message added via subscription:", newMessage);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up Supabase subscription for chatId:", chatId);
      supabase.removeChannel(channel);
    };
  }, [role, supabase, chatId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Validate non-empty message
    setSending(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim(), language: null }),
      });
      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.statusText}`);
      }
      const data = await res.json();
      // Prevent duplicate messages by checking message_id
      setMessages((prev) =>
        prev.some((msg) => msg.message_id === data.message.message_id)
          ? prev
          : [...prev, data.message]
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isLoading && role !== "customer" && role !== "tailor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white shadow-md">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold truncate">
            {chat
              ? role === "customer"
                ? chat.tailor.full_name || chat.tailor.username
                : chat.customer.full_name || chat.customer.username
              : "Loading..."}
          </h1>
        </div>

        {/* Messages Area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-500">Loading chat...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  Start chatting with your{" "}
                  {role === "customer" ? "tailor" : "customer"}!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${
                    message.sender_id === currentUserId
                      ? "justify-end"
                      : "justify-start"
                  } mb-3`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                      message.sender_id === currentUserId
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        {!isLoading && (
          <div className="p-4 border-t bg-white sticky bottom-0">
            <div className="flex items-center space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !sending && newMessage.trim()) {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 flex items-center justify-center"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
