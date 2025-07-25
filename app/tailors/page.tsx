"use client";

import type { User } from "@/lib/model/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/headers/header";
import {
  Search,
  MapPin,
  Star,
  Users,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function TailorsPage() {
  const router = useRouter();
  const [role, setRole] = useState<"guest" | "customer" | "tailor" | "loading">(
    "loading"
  );
  const [tailors, setTailors] = useState<User[]>([]);
  const [filteredTailors, setFilteredTailors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [completedOrders, setCompletedOrders] = useState<
    Record<string, number>
  >({});
  const [avgRating, setAvgRating] = useState(0);
  const [chatLoading, setChatLoading] = useState<Record<string, boolean>>({});

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

    const fetchTailors = async () => {
      const res = await fetch("/api/tailors");
      if (!res.ok) throw new Error("Failed fetching tailors");
      const data = await res.json();
      setTailors(data.tailors);
      setFilteredTailors(data.tailors);
      const counts: Record<string, number> = {};
      let totalRating = 0;
      let ratingCount = 0;

      await Promise.all(
        data.tailors.map(async (t: User) => {
          try {
            const res = await fetch(
              `/api/tailors/${t.user_id}/completed-orders`
            );
            if (!res.ok) throw new Error("fail");
            const d = await res.json();
            counts[t.user_id] = d.completedCount;
          } catch {
            counts[t.user_id] = 0;
          }
          const rating = t.TailorDetails?.[0]?.rating ?? 0;
          if (typeof rating === "number" && !Number.isNaN(rating)) {
            totalRating += rating;
            ratingCount += 1;
          }
        })
      );

      setCompletedOrders(counts);
      setAvgRating(ratingCount > 0 ? totalRating / ratingCount : 0);
      setIsLoading(false);
    };

    const init = async () => {
      const role = await fetchUser();
      if (role === "customer") {
        await fetchTailors();
      } else {
        router.push("/");
      }
    };

    init();
  }, [router]);

  // Filter and search logic
  useEffect(() => {
    let filtered = tailors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tailor) =>
          tailor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tailor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tailor.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((tailor) =>
        tailor.location?.includes(locationFilter)
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = Number.parseFloat(ratingFilter);
      filtered = filtered.filter(
        (tailor) => (tailor.TailorDetails?.[0]?.rating ?? 0) >= minRating
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (
            (b.TailorDetails?.[0]?.rating ?? 0) -
            (a.TailorDetails?.[0]?.rating ?? 0)
          );
        case "name":
          return (a.full_name || a.username).localeCompare(
            b.full_name || b.username
          );
        case "location":
          return (a.location || "").localeCompare(b.location || "");
        default:
          return 0;
      }
    });

    setFilteredTailors(filtered);
  }, [tailors, searchQuery, locationFilter, ratingFilter, sortBy]);

  const handleChatClick = async (tailorId: string) => {
    setChatLoading((prev) => ({ ...prev, [tailorId]: true }));
    try {
      const res = await fetch("/api/chats/check-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailorId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to check or create chat");
      }
      const data = await res.json();
      router.push(`/chat/${data.chat.chat_id}`);
    } catch (error) {
      console.error("Error initiating chat:", error);
    } finally {
      setChatLoading((prev) => ({ ...prev, [tailorId]: false }));
    }
  };

  if (!isLoading && role !== "customer") {
    router.push("/");
    return null;
  }

  const uniqueLocations = Array.from(
    new Set(tailors.map((tailor) => tailor.location).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-teal-pink text-white py-16 px-6 animate-fade-in-up">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-title font-bold mb-4">
            Meet Our Master Tailors
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 font-body">
            Discover Indonesia&apos;s finest craftspeople, each bringing
            generations of expertise in traditional batik artistry
          </p>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center animate-pulse-slow">
              <div className="text-3xl font-bold font-title">
                {tailors.length}+
              </div>
              <div className="text-sm text-white/80 font-body">
                Expert Tailors
              </div>
            </div>
            <div className="text-center animate-pulse-slow-delayed">
              <div className="text-3xl font-bold font-title">
                {uniqueLocations.length}+
              </div>
              <div className="text-sm text-white/80 font-body">Regions</div>
            </div>
            <div className="text-center animate-pulse-slow">
              <div className="text-3xl font-bold font-title">
                {avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-white/80 font-body">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-6 bg-cream border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tailors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-border/50 focus:border-primary bg-background font-body"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40 h-12 border-border/50 bg-background font-body">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-body">
                    All Locations
                  </SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem
                      key={location}
                      value={location || ""}
                      className="font-body"
                    >
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32 h-12 border-border/50 bg-background font-body">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-body">
                    All Ratings
                  </SelectItem>
                  <SelectItem value="4.5" className="font-body">
                    4.5+ Stars
                  </SelectItem>
                  <SelectItem value="4.0" className="font-body">
                    4.0+ Stars
                  </SelectItem>
                  <SelectItem value="3.5" className="font-body">
                    3.5+ Stars
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-12 border-border/50 bg-background font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating" className="font-body">
                    By Rating
                  </SelectItem>
                  <SelectItem value="name" className="font-body">
                    By Name
                  </SelectItem>
                  <SelectItem value="location" className="font-body">
                    By Location
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground font-body">
            Showing {filteredTailors.length} of {tailors.length} tailors
          </div>
        </div>
      </section>

      {/* Tailors Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground font-body">
                  Loading our amazing tailors...
                </p>
              </div>
            </div>
          ) : filteredTailors.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-title font-bold mb-4">
                No tailors found
              </h3>
              <p className="text-muted-foreground mb-6 font-body">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("all");
                  setRatingFilter("all");
                }}
                variant="outline"
                className="font-body"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTailors.map((tailor, index) => (
                <Card
                  key={tailor.user_id}
                  className="group hover-lift border-0 shadow-lg bg-background/80 backdrop-blur-sm overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    {/* Profile Image */}
                    <div className="relative h-48 bg-gradient-coral-pink">
                      <Image
                        src={
                          tailor.profile_picture_url ||
                          "/placeholder.svg?height=200&width=300&query=tailor" ||
                          "/placeholder.svg"
                        }
                        alt={tailor.full_name || tailor.username}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-background/90 text-foreground border-0 font-body">
                          <Star className="h-3 w-3 mr-1 fill-accent text-accent" />
                          {tailor.TailorDetails?.[0]?.rating?.toFixed(1) ??
                            "0.0"}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-title font-bold text-foreground group-hover:text-primary transition-colors">
                          {tailor.full_name || tailor.username}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 font-body">
                          <MapPin className="h-4 w-4 mr-1" />
                          {tailor.location || "Location not specified"}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3 font-body">
                        {tailor.TailorDetails?.[0]?.bio ||
                          "One of our amazing tailors!"}
                      </p>

                      {/* Skills/Specialties */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs font-body">
                          {tailor.dialect || "Indonesian"}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center font-body">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {completedOrders[tailor.user_id] ?? 0} orders
                              completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4">
                        <Button
                          className="w-full bg-gradient-teal-pink hover:opacity-90 text-white rounded-xl group font-body"
                          onClick={() => handleChatClick(tailor.user_id)}
                          disabled={chatLoading[tailor.user_id]}
                        >
                          {chatLoading[tailor.user_id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <MessageCircle className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          )}
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-coral text-coral-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-title font-bold mb-6">
            Ready to Start Your Custom Order?
          </h2>
          <p className="text-xl text-coral-foreground/90 mb-8 font-body">
            Connect with our master tailors and bring your batik vision to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/3d-design">
              <Button
                size="lg"
                className="bg-coral-foreground text-coral hover:bg-coral-foreground/90 rounded-full px-8 py-6 text-lg font-medium hover-lift font-body"
              >
                Start Designing
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="outline"
                size="lg"
                className="border-coral-foreground text-coral-foreground hover:bg-coral-foreground hover:text-coral rounded-full px-8 py-6 text-lg bg-transparent hover-lift font-body"
              >
                Chat with Tailors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-burgundy text-burgundy-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded animate-float"></div>
                <span className="text-2xl font-title font-bold">METI</span>
              </div>
              <p className="text-burgundy-foreground/80 font-body">
                Connecting Indonesia&apos;s heritage with modern fashion through
                personalized batik clothing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4 font-title">
                Platform
              </h4>
              <div className="space-y-2 text-burgundy-foreground/80 font-body">
                <Link
                  href="/3d-design"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Design Studio
                </Link>
                <Link
                  href="/tailors"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Find Tailors
                </Link>
                <Link
                  href="/community"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Community
                </Link>
                <Link
                  href="/stories"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Stories
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4 font-title">Support</h4>
              <div className="space-y-2 text-burgundy-foreground/80 font-body">
                <Link
                  href="/help"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Help Center
                </Link>
                <Link
                  href="/size-guide"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Size Guide
                </Link>
                <Link
                  href="/shipping"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Shipping
                </Link>
                <Link
                  href="/returns"
                  className="block hover:text-burgundy-foreground transition-colors hover-lift"
                >
                  Returns
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4 font-title">Contact</h4>
              <div className="space-y-2 text-burgundy-foreground/80 font-body">
                <p>hello@meti.co.id</p>
                <p>+62 812 3456 789</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-burgundy-foreground/20 pt-8 text-center text-burgundy-foreground/60">
            <p className="font-body">
              © 2024 METI. Preserving heritage, creating futures.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
