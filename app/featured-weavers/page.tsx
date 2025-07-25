"use client";

import Header from "@/components/headers/header";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function FeaturedWeaversPage() {
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const toggleLike = (index: number) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(index)) {
      newLiked.delete(index);
    } else {
      newLiked.add(index);
    }
    setLikedItems(newLiked);
  };

  // Featured weavers data
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

  // Border colors for the masonry grid
  const borderColors = [
    "border-meti-pink",
    "border-meti-orange",
    "border-meti-teal",
    "border-meti-pink",
    "border-meti-teal",
    "border-meti-orange",
    "border-meti-pink",
    "border-meti-teal",
    "border-meti-orange",
    "border-meti-pink",
    "border-meti-orange",
    "border-meti-teal",
  ];

  // New designs data - using different sizes for masonry layout
  const newDesigns = [
    {
      id: 1,
      name: "Batik Jacket",
      price: 299,
      size: "large",
      image: "/Random batik clothes/image (1).jpg",
    },
    {
      id: 2,
      name: "Woven Scarf",
      price: 89,
      size: "small",
      image: "/Random batik clothes/image (2).jpg",
    },
    {
      id: 3,
      name: "Traditional Dress",
      price: 459,
      size: "medium",
      image: "/Random batik clothes/image (3).jpg",
    },
    {
      id: 4,
      name: "Handwoven Bag",
      price: 129,
      size: "small",
      image: "/Random batik clothes/image (4).jpg",
    },
    {
      id: 5,
      name: "Ceremonial Robe",
      price: 699,
      size: "large",
      image: "/Random batik clothes/image (5).jpg",
    },
    {
      id: 6,
      name: "Silk Blouse",
      price: 199,
      size: "medium",
      image: "/Random batik clothes/image (6).jpg",
    },
    {
      id: 7,
      name: "Woven Belt",
      price: 59,
      size: "small",
      image: "/Random batik clothes/image (7).jpg",
    },
    {
      id: 8,
      name: "Festival Outfit",
      price: 399,
      size: "large",
      image: "/Random batik clothes/image (8).jpg",
    },
    {
      id: 9,
      name: "Cotton Sarong",
      price: 149,
      size: "medium",
      image: "/Random batik clothes/image (9).jpg",
    },
    {
      id: 10,
      name: "Embroidered Shawl",
      price: 179,
      size: "small",
      image: "/Random batik clothes/image (10).jpg",
    },
    {
      id: 11,
      name: "Traditional Vest",
      price: 249,
      size: "medium",
      image: "/Random batik clothes/image (11).jpg",
    },
    {
      id: 12,
      name: "Woven Headband",
      price: 39,
      size: "small",
      image: "/Random batik clothes/image (12).jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-12 py-16 relative">
        {/* Decorative pink background element */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-meti-pink/20 rounded-full -translate-x-32 -translate-y-16"></div>

        {/* Curved decorative lines */}
        <svg
          className="absolute top-64 right-0 w-96 h-32 text-meti-pink"
          viewBox="0 0 400 120"
        >
          <path
            d="M0,60 Q200,0 400,60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <svg
          className="absolute bottom-96 left-0 w-64 h-32 text-meti-pink"
          viewBox="0 0 300 120"
        >
          <path
            d="M0,60 Q150,120 300,60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Featured Weavers Section */}
        <section className="mb-20 relative z-10">
          <div className="mb-12">
            <h1 className="text-5xl font-serif text-meti-pink leading-tight">
              FEATURED
              <br />
              WEAVERS
            </h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-2/3 mx-auto">
            {featuredWeavers.map((weaver, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden mb-6 relative shadow-sm">
                  <img
                    src={weaver.image || "/placeholder.svg"}
                    alt={weaver.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-meti-dark text-lg">
                    {weaver.name}
                  </h3>
                  <p className="text-meti-dark/70 text-sm">{weaver.location}</p>
                  <p className="text-meti-teal font-medium text-sm">
                    {weaver.specialty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Designs Section */}
        <section className="relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-8 mb-8">
              <span className="text-meti-orange text-sm font-medium">
                POPULAR
              </span>
              <h2 className="text-3xl font-serif text-meti-orange">
                NEW DESIGNS
              </h2>
              <span className="text-meti-orange text-sm font-medium">
                FOR YOU
              </span>
            </div>
          </div>

          {/* Masonry Grid Layout with Colorful Borders */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {newDesigns.map((item, index) => (
              <div
                key={item.id}
                className={`break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 ${
                  borderColors[index]
                } ${
                  item.size === "large"
                    ? "aspect-[3/4]"
                    : item.size === "medium"
                    ? "aspect-[4/5]"
                    : "aspect-square"
                }`}
              >
                <div className="relative overflow-hidden h-full flex items-center justify-center">
                  {/* Placeholder content with colored circle */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Special pagination element for one card */}
                  {index === 7 && (
                    <div className="absolute bottom-6 right-6 bg-white rounded-full px-3 py-2 flex items-center space-x-1 shadow-sm">
                      <div className="w-3 h-3 bg-black rounded-sm"></div>
                      <div className="w-3 h-3 border border-black rounded-sm"></div>
                      <div className="w-3 h-3 bg-black rounded-sm"></div>
                    </div>
                  )}

                  {/* Heart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(index);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedItems.has(index)
                          ? "text-meti-pink fill-meti-pink"
                          : "text-meti-dark"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-meti-teal text-white px-8 py-3 rounded-lg font-medium hover:bg-meti-teal/90 transition-colors">
              Load More Designs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
