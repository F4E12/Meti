"use client";

import Header from "@/components/headers/header";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface Tag {
  tag_id: number;
  name: string;
}

interface DesignFromAPI {
  design_id: string;
  original_image_url: string;
  description: string | null;
  created_at: string | null;
  tags: Tag[];
}

interface Design {
  id: string;
  name: string;
  image: string;
  tags: string[];
}

interface PaginatedResponse {
  designs: DesignFromAPI[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function FeaturedWeaversPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchDesigns = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/designs/get-all?page=${pageNum}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch: ${res.status} ${errorText}`);
      }

      const data: PaginatedResponse = await res.json();

      const transformed: Design[] = data.designs.map((d) => ({
        id: d.design_id,
        name: d.description || "Untitled Design",
        image: d.original_image_url,
        tags: d.tags.map((t) => t.name),
      }));

      if (pageNum === 1) {
        setDesigns(transformed);
      } else {
        setDesigns((prev) => [...prev, ...transformed]);
      }

      setHasMore(data.page < data.totalPages);
    } catch (err) {
      console.error("Error loading designs:", err);
      if (page === 1) setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns(1);
  }, []);

  useEffect(() => {
    if (page > 1) fetchDesigns(page);
  }, [page]);

  const toggleLike = (designId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(designId)) {
        newSet.delete(designId);
      } else {
        newSet.add(designId);
      }
      return newSet;
    });
  };

  const loadMore = () => setPage((p) => p + 1);

  const featuredWeavers = [
    {
      name: "Master Weaver Sari",
      location: "Yogyakarta, Indonesia",
      specialty: "Traditional Batik",
      image: "/Random batik clothes/image (13).jpg",
    },
    {
      name: "Artisan Budi",
      location: "Solo, Central Java",
      specialty: "Ikat Weaving",
      image: "/Random batik clothes/image (14).jpg",
    },
    {
      name: "Craftsman Adi",
      location: "Ubud, Bali",
      specialty: "Songket Fabric",
      image: "/Random batik clothes/image (15).jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-slate-200/30 to-slate-100/20 rounded-full -translate-x-48 -translate-y-24 blur-3xl pointer-events-none"></div>

        {/* Featured Weavers Section */}
        <section className="mb-24 relative z-10">
          <div className="mb-12">
            <h1 className="text-5xl lg:text-6xl font-serif text-slate-900 leading-tight">
              FEATURED
              <br />
              WEAVERS
            </h1>
            <p className="text-lg text-slate-600 mt-4 max-w-lg font-light">
              Discover master artisans crafting traditional Indonesian textiles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredWeavers.map((weaver, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-white rounded-xl overflow-hidden mb-6 relative shadow-sm hover:shadow-md transition-all duration-500">
                  <img
                    src={weaver.image || "/placeholder.svg"}
                    alt={weaver.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {weaver.name}
                  </h3>
                  <p className="text-slate-600 text-sm">{weaver.location}</p>
                  <p className="text-slate-700 font-medium text-sm pt-1">
                    {weaver.specialty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Designs Section */}
        <section className="relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              COLLECTION
            </p>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
              All Designs
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto font-light">
              Explore our complete collection of contemporary and traditional
              patterns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[420px]">
            {designs.map((design, index) => (
              <div
                key={design.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group cursor-pointer border border-slate-200/50 flex flex-col"
                onClick={() => router.push(`/3d-design/${design.id}`)}
              >
                <div className="relative flex-1 overflow-hidden bg-slate-100">
                  <img
                    src={design.image || "/placeholder.svg"}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {design.tags.length > 0 && (
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                      {design.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-white/90 backdrop-blur-md text-xs px-2.5 py-1 rounded-full font-medium text-slate-700 shadow-sm border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {design.tags.length > 2 && (
                        <span className="bg-white/90 backdrop-blur-md text-xs px-2.5 py-1 rounded-full font-medium text-slate-700 shadow-sm border border-white/20">
                          +{design.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(design.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md border border-white/20 hover:bg-white"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        likedItems.has(design.id)
                          ? "text-red-500 fill-red-500"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-white border-t border-slate-100/50">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-2 leading-snug">
                    {design.name}
                  </h3>
                </div>
              </div>
            ))}

            {/* Loading Skeletons */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50"
                >
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
          </div>

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center mt-20">
              <Button
                onClick={loadMore}
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-12 py-6 text-base rounded-lg transition-all hover:shadow-lg"
              >
                Load More Designs
              </Button>
            </div>
          )}

          {/* End States */}
          {!hasMore && designs.length > 0 && (
            <p className="text-center mt-20 text-slate-500 text-base font-light">
              You&apos;ve viewed all designs in this collection
            </p>
          )}

          {!loading && designs.length === 0 && (
            <p className="text-center py-24 text-slate-400 text-lg font-light">
              No designs available yet. Check back soon!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
