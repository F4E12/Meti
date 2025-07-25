"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Edit,
  Ruler,
  MapPin,
  Globe,
  Mail,
  UserIcon,
  Star,
  Save,
  X,
  History,
  Heart,
  Settings,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import SizePopup from "@/components/size-popup";
import Header from "@/components/headers/header";
import type { User } from "@/lib/model/user";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizeData, setSizeData] = useState({
    right_arm_length: 0,
    shoulder_width: 0,
    left_arm_length: 0,
    upper_body_height: 0,
    hip_width: 0,
  });
  const [hasSizeData, setHasSizeData] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    location: "",
    dialect: "",
    profile_picture_url: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        if (!res.ok) {
          redirect("/auth/login");
          return;
        }
        const data: { user: User } = await res.json();
        if (!data.user) {
          redirect("/auth/login");
        }
        setUser(data.user);
        setFormData({
          username: data.user.username,
          email: data.user.email,
          full_name: data.user.full_name || "",
          location: data.user.location || "",
          dialect: data.user.dialect || "",
          profile_picture_url: data.user.profile_picture_url,
          bio: data.user.TailorDetails?.[0]?.bio || "",
        });
        setSizeData({
          right_arm_length: data.user.right_arm_length || 0,
          shoulder_width: data.user.shoulder_width || 0,
          left_arm_length: data.user.left_arm_length || 0,
          upper_body_height: data.user.upper_body_height || 0,
          hip_width: data.user.hip_width || 0,
        });
        setHasSizeData(
          !!data.user.right_arm_length &&
            !!data.user.shoulder_width &&
            !!data.user.left_arm_length &&
            !!data.user.upper_body_height &&
            !!data.user.hip_width
        );
      } catch (error) {
        console.error("Error fetching user:", error);
        redirect("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: user?.role,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to update profile");
      }
      const { user: updatedUser } = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  const handleSizeClick = () => {
    if (!hasSizeData) {
      router.push("/measure");
    } else {
      setShowSizePopup(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Profile Header Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 ring-4 ring-white shadow-xl">
                  <Image
                    src={
                      formData.profile_picture_url ||
                      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/no_pp.jpg" ||
                      "/placeholder.svg"
                    }
                    width={128}
                    height={128}
                    alt={user.full_name || "Profile"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <Input
                      type="text"
                      name="profile_picture_url"
                      value={formData.profile_picture_url}
                      onChange={handleInputChange}
                      placeholder="Profile picture URL"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                      />
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                      />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                      />
                      <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Location"
                      />
                      <Input
                        type="text"
                        name="dialect"
                        value={formData.dialect}
                        onChange={handleInputChange}
                        placeholder="Preferred Language"
                      />
                    </div>
                    {user.role === "tailor" && (
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Bio"
                        className="h-24"
                      />
                    )}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">
                          {user.full_name}
                        </h1>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-lg">@{user.username}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 text-slate-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-600">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {user.location || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-600">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">
                          {user.dialect || "Not specified"}
                        </span>
                      </div>
                      {user.role === "tailor" && (
                        <div className="flex items-center space-x-3 text-slate-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            Rating: {user.TailorDetails?.[0]?.rating || 0}/5
                          </span>
                        </div>
                      )}
                    </div>

                    {user.role === "tailor" && user.TailorDetails?.[0]?.bio && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          About
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {user.TailorDetails[0].bio}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="absolute top-6 right-6 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Profile Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Account Details */}
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <UserIcon className="w-5 h-5 text-blue-500" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    User ID
                  </label>
                  <div className="mt-1 bg-slate-100 rounded-lg px-3 py-2">
                    <code className="text-sm text-slate-700 font-mono">
                      {user.user_id}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <p className="text-slate-900 mt-1 font-medium">
                    {user.full_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Username
                  </label>
                  <p className="text-slate-900 mt-1">@{user.username}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="text-slate-900 mt-1">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Information */}
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Ruler className="w-5 h-5 text-orange-500" />
                Size Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasSizeData ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-green-800 font-medium text-sm">
                        Measurements Complete
                      </p>
                    </div>
                    <p className="text-green-700 text-sm">
                      Your measurements are saved for personalized fitting.
                    </p>
                  </div>
                  <Button
                    onClick={handleSizeClick}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    View Measurements
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <p className="text-amber-800 font-medium text-sm">
                        Measurements Required
                      </p>
                    </div>
                    <p className="text-amber-700 text-sm">
                      Add your measurements to get perfectly fitted personalized
                      apparel.
                    </p>
                  </div>
                  <Button
                    onClick={handleSizeClick}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    Add Measurements
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Language */}
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Globe className="w-5 h-5 text-purple-500" />
                Location & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Location
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <p className="text-slate-900">
                    {user.location || "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Preferred Language
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <p className="text-slate-900">
                    {user.dialect || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Settings className="w-5 h-5 text-slate-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Order History</p>
                    <p className="text-sm text-slate-600">
                      View your past orders
                    </p>
                  </div>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Wishlist</p>
                    <p className="text-sm text-slate-600">
                      Saved items for later
                    </p>
                  </div>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-600" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Settings</p>
                    <p className="text-sm text-slate-600">
                      Account preferences
                    </p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-full h-full m-auto items-center justify-center flex">
        <LogoutButton />
      </div>

      {showSizePopup && (
        <SizePopup
          sizeData={sizeData}
          onClose={() => setShowSizePopup(false)}
        />
      )}
    </div>
  );
}
