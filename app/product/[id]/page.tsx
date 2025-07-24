"use client";

import { ArrowLeft, Plus, Heart, Share2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app, fetch based on params.id
  const product = {
    id: params.id,
    name: "Example Batik",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 124,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit.",
    colors: [
      { name: "Pink", value: "#dd2b64", class: "bg-meti-pink" },
      { name: "Orange", value: "#f3714a", class: "bg-meti-orange" },
      { name: "Black", value: "#000000", class: "bg-black" },
    ],
    images: [
      "https://picsum.photos/200/300",
      "https://picsum.photos/200/300",
      "https://picsum.photos/200/300",
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    weaver: {
      name: "Master Weaver Sari",
      location: "Yogyakarta, Indonesia",
    },
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log("Added to cart:", {
      productId: product.id,
      quantity,
      color: selectedColor,
    });
  };

  const handleBuyNow = () => {
    // Buy now logic here
    console.log("Buy now:", {
      productId: product.id,
      quantity,
      color: selectedColor,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-meti-dark hover:text-meti-teal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-meti-pink rounded flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-meti-dark font-bold text-xl">METI</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "text-meti-pink fill-meti-pink" : "text-meti-dark"
                }`}
              />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5 text-meti-dark" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            <div className="flex justify-center space-x-3">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    selectedImage === index ? "bg-meti-teal" : "bg-black"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Title and Rating */}
            <div>
              <h1 className="text-4xl font-serif text-meti-teal mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-meti-dark/70 text-sm ml-2">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-meti-dark">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-meti-dark/50 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="bg-meti-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                  Save ${product.originalPrice! - product.price}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border-l-4 border-meti-teal">
              <p className="text-meti-dark/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-meti-dark mb-4">
                Choose Color
              </h3>
              <div className="flex space-x-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-12 h-12 rounded-full ${
                      color.class
                    } border-4 transition-all ${
                      selectedColor === index
                        ? "border-meti-teal scale-110"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-meti-dark/70 mt-2">
                Selected: {product.colors[selectedColor].name}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-meti-dark mb-4">
                Size
              </h3>
              <div className="flex space-x-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-meti-teal hover:text-meti-teal transition-colors font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-meti-dark mb-4">
                Quantity
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-semibold text-meti-dark w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-meti-pink text-white py-4 px-6 rounded-xl font-semibold hover:bg-meti-pink/90 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Buy</span>
              </button>
              <button
                onClick={handleAddToCart}
                className="w-14 h-14 border-2 border-meti-teal text-meti-teal rounded-xl hover:bg-meti-teal hover:text-white transition-colors flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Weaver Info */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-meti-dark mb-3">
                Crafted by
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-meti-teal/10 rounded-full flex items-center justify-center">
                  <span className="text-meti-teal font-semibold">
                    {product.weaver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-meti-dark">
                    {product.weaver.name}
                  </p>
                  <p className="text-sm text-meti-dark/70">
                    {product.weaver.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.inStock ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-meti-dark/70">
                {product.inStock ? "In Stock - Ready to ship" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-meti-dark mb-3">
              🚚 Free Shipping
            </h3>
            <p className="text-sm text-meti-dark/70">
              Free shipping on orders over $200
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-meti-dark mb-3">
              🔄 Easy Returns
            </h3>
            <p className="text-sm text-meti-dark/70">30-day return policy</p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-meti-dark mb-3">
              🎨 Handcrafted
            </h3>
            <p className="text-sm text-meti-dark/70">
              Made by skilled artisans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
