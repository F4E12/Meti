"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Ruler,
  MapPin,
  Globe,
  Mail,
  User as UserIcon,
  Camera,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import SizePopup from "@/components/size-popup";
import type { User } from "@/lib/model/user";

// Mock user data - replace with actual data fetching
const mockUser = {
  user_id: "USR001",
  username: "artisan_lover",
  email: "user@example.com",
  role: "customer",
  full_name: "Sarah Johnson",
  location: "Jakarta, Indonesia",
  dialect: "Bahasa Indonesia",
  profile_picture:
    "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/no_pp.jpg",
};

// Mock size data - replace with actual data fetching
const mockSizeData = {
  right_arm_length: 58.5,
  shoulder_width: 42.0,
  left_arm_length: 58.0,
  upper_body_height: 65.5,
  hip_width: 38.5,
};

export default function ProfilePage() {
  const router = useRouter();
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [sizeData, setSizeData] = useState(mockSizeData);
  const [hasSizeData, setHasSizeData] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        if (!res.ok) {
          return;
        }
        const data: { user: User } = await res.json();
        if (!data.user) {
          redirect("/auth/login");
          return;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Check if user has size data
    // Replace this with actual API call
    const checkSizeData = () => {
      if (!sizeData || Object.values(sizeData).some((value) => !value)) {
        setHasSizeData(false);
      }
    };

    checkSizeData();
  }, [sizeData]);

  const handleSizeClick = () => {
    if (!hasSizeData) {
      router.push("/measure");
    } else {
      setShowSizePopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-meti-cream">
      {/* Header */}
      <header className="bg-meti-teal px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-white hover:text-meti-pink transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-meti-pink rounded flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-white font-bold text-xl">METI</span>
          </div>

          <button className="text-white hover:text-meti-pink transition-colors">
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={
                    user.profile_picture ||
                    "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/no_pp.jpg"
                  }
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-meti-teal rounded-full flex items-center justify-center text-white hover:bg-meti-teal/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-serif text-meti-dark mb-2">
                  {user.full_name}
                </h1>
                <p className="text-meti-dark/70">@{user.username}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-meti-dark/70">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-meti-dark/70">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm capitalize">{user.role}</span>
                </div>
                <div className="flex items-center space-x-3 text-meti-dark/70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-meti-dark/70">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{user.dialect}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-serif text-meti-dark mb-6">
              Account Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  User ID
                </label>
                <p className="text-meti-dark font-mono text-sm bg-gray-50 px-3 py-2 rounded mt-1">
                  {user.user_id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  Full Name
                </label>
                <p className="text-meti-dark mt-1">{user.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  Username
                </label>
                <p className="text-meti-dark mt-1">@{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  Email
                </label>
                <p className="text-meti-dark mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Size Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-meti-dark">
                Size Information
              </h2>
              <Ruler className="w-5 h-5 text-meti-teal" />
            </div>

            {hasSizeData ? (
              <div className="space-y-4">
                <p className="text-meti-dark/70 text-sm mb-4">
                  Your measurements are saved for personalized fitting.
                </p>
                <button
                  onClick={handleSizeClick}
                  className="w-full bg-meti-teal text-white py-3 px-4 rounded hover:bg-meti-teal/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Ruler className="w-4 h-4" />
                  <span>View Measurements</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-meti-orange/10 border border-meti-orange/20 rounded-lg p-4">
                  <p className="text-meti-orange text-sm font-medium mb-2">
                    Measurements Required
                  </p>
                  <p className="text-meti-dark/70 text-sm">
                    Add your measurements to get perfectly fitted personalized
                    apparel.
                  </p>
                </div>
                <button
                  onClick={handleSizeClick}
                  className="w-full bg-meti-orange text-white py-3 px-4 rounded hover:bg-meti-orange/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Add Measurements</span>
                </button>
              </div>
            )}
          </div>

          {/* Location & Language */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-serif text-meti-dark mb-6">
              Location & Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  Location
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-meti-teal" />
                  <p className="text-meti-dark">{user.location}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-meti-dark/70">
                  Preferred Language
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Globe className="w-4 h-4 text-meti-teal" />
                  <p className="text-meti-dark">{user.dialect}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-serif text-meti-dark mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded border border-gray-200 hover:border-meti-teal hover:bg-meti-teal/5 transition-colors">
                <span className="text-meti-dark font-medium">
                  Order History
                </span>
                <p className="text-meti-dark/60 text-sm mt-1">
                  View your past orders
                </p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded border border-gray-200 hover:border-meti-teal hover:bg-meti-teal/5 transition-colors">
                <span className="text-meti-dark font-medium">Wishlist</span>
                <p className="text-meti-dark/60 text-sm mt-1">
                  Saved items for later
                </p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded border border-gray-200 hover:border-meti-teal hover:bg-meti-teal/5 transition-colors">
                <span className="text-meti-dark font-medium">Settings</span>
                <p className="text-meti-dark/60 text-sm mt-1">
                  Account preferences
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <LogoutButton />
      {/* Size Popup */}
      {showSizePopup && (
        <SizePopup
          sizeData={sizeData}
          onClose={() => setShowSizePopup(false)}
        />
      )}
    </div>
  );
}
