import Header from "@/components/headers/header";
import { Star, ArrowRight, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-meti-cream">
      {/* Header Section */}
      <header className="bg-meti-teal relative overflow-hidden min-h-screen">
        <Header />
        {/* Hero Content - Matching Screenshot Layout */}
        <div className="relative z-10 px-12 pb-24 pt-8">
          <div className="max-w-6xl mx-auto relative">
            {/* Title positioned like in screenshot */}
            <div className="relative">
              <h1 className="text-white font-serif leading-none">
                <div className="text-6xl md:text-7xl mb-4">WEAVING</div>
                <div className="text-6xl md:text-7xl text-right mr-0 mb-4">
                  PERSONALIZED
                </div>
                <div className="text-6xl md:text-7xl ml-0">APPAREL</div>
              </h1>
            </div>

            {/* Pink accent elements positioned like screenshot */}
            <div className="absolute bottom-[-80px] left-0 flex items-end space-x-6">
              <div className="w-16 h-4 bg-meti-pink"></div>
              <button className="bg-meti-pink text-white px-8 py-3 font-medium hover:bg-meti-pink/90 transition-colors flex items-center space-x-2">
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pink accent boxes positioned like screenshot */}
            <div className="absolute top-44 right-0 flex space-x-4">
              <div className="w-20 h-20 bg-meti-pink"></div>
              <div className="w-20 h-20 bg-meti-pink"></div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-40 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-60 right-60 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>

        {/* Curved decorative line */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <svg
            width="300"
            height="100"
            viewBox="0 0 300 100"
            className="text-meti-pink"
          >
            <path
              d="M0,50 Q150,0 300,50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-12 left-12 flex space-x-3">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>
      </header>

      {/* Scrolling Text Banner */}
      <div className="bg-white border-y border-gray-200 py-6 overflow-hidden">
        <div className="scrolling-text whitespace-nowrap text-xl font-medium">
          Premium Quality • Handcrafted • Sustainable Fashion • Local Artisans •
          Premium Quality • Handcrafted • Sustainable Fashion • Local Artisans •
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="bg-meti-cream py-24">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-meti-dark mb-4">
              Featured Collection
            </h2>
            <p className="text-meti-dark/70 max-w-2xl mx-auto">
              Discover our carefully curated selection of handwoven apparel,
              each piece telling a unique story of craftsmanship and tradition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-white mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-meti-teal/10 group-hover:bg-meti-teal/20 transition-colors"></div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-6 h-6 text-meti-pink" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-meti-dark">
                    Handwoven Jacket {item}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-meti-dark/60">
                      (24 reviews)
                    </span>
                  </div>
                  <p className="font-semibold text-meti-dark">$299.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Craftsmen Section */}
      <section className="bg-meti-orange relative overflow-hidden">
        <div className="container mx-auto px-12 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-white text-5xl font-serif leading-tight">
                Support
                <br />
                Craftsmen
              </h2>
              <p className="text-white text-base leading-relaxed max-w-md">
                Every purchase directly supports local artisans and their
                families. We believe in fair trade practices and preserving
                traditional weaving techniques that have been passed down
                through generations.
              </p>
              <button className="bg-white text-meti-orange px-8 py-3 font-medium hover:bg-white/90 transition-colors flex items-center space-x-2">
                <span>LEARN MORE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-meti-teal/10"></div>
              </div>
              <div className="aspect-square bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-meti-pink/10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative curved element */}
        <div className="absolute bottom-0 right-0 w-64 h-32 opacity-20">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M0,100 Q100,0 200,100 L200,100 L0,100 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="bg-meti-cream relative py-24">
        <div className="container mx-auto px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-meti-teal/20"></div>
              </div>
              <div className="aspect-square bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-meti-pink/20"></div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-meti-dark text-5xl font-serif leading-tight">
                Be a Part of
                <br />
                The Heritage
              </h2>
              <p className="text-meti-dark/70 leading-relaxed">
                Join our community of conscious consumers who value
                authenticity, sustainability, and the preservation of cultural
                heritage through fashion.
              </p>
              <button className="bg-meti-teal text-white px-8 py-3 font-medium hover:bg-meti-teal/90 transition-colors flex items-center space-x-2">
                <span>JOIN US</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          <div className="absolute top-20 right-20 w-32 h-32 bg-meti-teal rounded-full"></div>
          <div className="absolute top-40 right-40 w-24 h-24 bg-meti-teal rounded-full"></div>
        </div>

        <div className="absolute bottom-0 left-0 w-64 h-32">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M0,0 Q100,100 200,0 L200,100 L0,100 Z" fill="#206877" />
          </svg>
        </div>
      </section>

      {/* Local Artisans Section */}
      <section className="bg-meti-teal py-24">
        <div className="container mx-auto px-12 text-center">
          <h2 className="text-white text-5xl font-serif mb-8 leading-tight">
            100% Made by Local
            <br />
            Artisans
          </h2>

          {/* Infinite Scrolling Gallery */}
          <div className="overflow-hidden mb-16">
            <div className="flex gallery-scroll space-x-6">
              {/* First set of images */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-48 bg-meti-pink relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white text-base mb-12 max-w-lg mx-auto leading-relaxed">
            Handcrafted with love by local artisans, preserving traditional
            techniques passed down through generations.
          </p>

          <button className="text-white text-xl font-medium border-b-2 border-white pb-2 hover:border-meti-pink hover:text-meti-pink transition-colors flex items-center space-x-2 mx-auto">
            <span>Explore now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-12 text-center">
          <h2 className="text-3xl font-serif text-meti-dark mb-4">
            Stay Connected
          </h2>
          <p className="text-meti-dark/70 mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive updates on new collections
            and artisan stories.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-meti-teal"
            />
            <button className="bg-meti-teal text-white px-8 py-3 font-medium hover:bg-meti-teal/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-meti-dark text-white py-16">
        <div className="container mx-auto px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-meti-pink rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-white font-bold text-2xl">METI</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Preserving traditional craftsmanship through contemporary
                fashion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Jackets
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Accessories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Artisans
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sustainability
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>meti@email.co.id</p>
                <p>+62 812 3456 789</p>
                <p>
                  RAGUNAN, Singapura, Cawat Regency, West Java 14672, Indonesia
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/70">
              © 2024 METI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
