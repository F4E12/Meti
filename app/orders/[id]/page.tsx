"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Order } from "@/lib/model/order";
import { User } from "@/lib/model/user";
import Header from "@/components/headers/header";

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [role, setRole] = useState<"customer" | "tailor" | "loading">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    const fetchUserAndOrder = async () => {
      try {
        // Fetch user role
        const userRes = await fetch("/api/user", { method: "GET" });
        if (!userRes.ok) {
          setError("Failed to fetch user data");
          setRole("loading");
          return;
        }
        const userData: { user: User } = await userRes.json();
        setRole(userData.user.role);

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
        });
        if (!orderRes.ok) {
          setError("Failed to fetch order details");
          return;
        }
        const orderData: { order: Order } = await orderRes.json();
        setOrder(orderData.order);
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      }
    };

    fetchUserAndOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel order");
        return;
      }
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    } catch (err) {
      setError("An error occurred while cancelling");
      console.error(err);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }), // Example: 7 days from now
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to confirm delivery");
        return;
      }
      const data: { order: Order } = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError("An error occurred while confirming");
      console.error(err);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to complete order");
        return;
      }
      const data: { order: Order } = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError("An error occurred while completing");
      console.error(err);
    }
  };

  if (role === "loading" || !order) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-full h-8 bg-muted animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (role !== "customer" && role !== "tailor") {
    return (
      <div className="text-center py-8 text-destructive font-sans">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Header />
      <h1 className="text-3xl font-serif font-bold text-foreground mb-6">
        Order #{order.order_id.slice(0, 8)}
      </h1>
      {error && <div className="text-destructive mb-4 font-sans">{error}</div>}
      <div className="border border-border/50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-serif font-semibold mb-2">
              Order Details
            </h2>
            <p className="font-sans">Status: {order.status.toUpperCase()}</p>
            <p className="font-sans">
              Ordered: {format(new Date(order.order_date), "PPP")}
            </p>
            {order.delivery_date && (
              <p className="font-sans">
                Delivery: {format(new Date(order.delivery_date), "PPP")}
              </p>
            )}
            <p className="font-sans">
              Created: {format(new Date(order.created_at), "PPP")}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold mb-2">Customer</h2>
            <p className="font-sans">Name: {order.customer!.full_name}</p>
            <Image
              src={order.customer!.profile_picture_url}
              width={50}
              height={50}
              alt={order.customer!.full_name || "Customer"}
              className="rounded-full mt-2"
            />
            <p className="font-sans">
              Right Arm: {order.customer!.right_arm_length || "N/A"} cm
            </p>
            <p className="font-sans">
              Shoulder: {order.customer!.shoulder_width || "N/A"} cm
            </p>
            <p className="font-sans">
              Left Arm: {order.customer!.left_arm_length || "N/A"} cm
            </p>
            <p className="font-sans">
              Upper Body: {order.customer!.upper_body_height || "N/A"} cm
            </p>
            <p className="font-sans">
              Hip: {order.customer!.hip_width || "N/A"} cm
            </p>
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold mb-2">Tailor</h2>
            <p className="font-sans">Name: {order.tailor!.full_name}</p>
            <Image
              src={order.tailor!.profile_picture_url}
              width={50}
              height={50}
              alt={order.tailor!.full_name || "Tailor"}
              className="rounded-full mt-2"
            />
            <p className="font-sans">Bio: {order.tailor!.bio || "N/A"}</p>
            <p className="font-sans">Rating: {order.tailor!.rating}</p>
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold mb-2">Design</h2>
            <Image
              src={order.design_url}
              width={100}
              height={100}
              alt="Order Design"
              className="rounded-lg mt-2"
            />
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          {(role === "customer" || role === "tailor") &&
            order.status === "pending" && (
              <button
                onClick={handleCancelOrder}
                className="bg-destructive text-primary-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 font-sans"
              >
                Cancel Order
              </button>
            )}
          {role === "tailor" && order.status === "pending" && (
            <button
              onClick={handleConfirmDelivery}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-sans"
            >
              Confirm Delivery
            </button>
          )}
          {role === "tailor" && order.status === "in_progress" && (
            <button
              onClick={handleCompleteOrder}
              className="bg-accent text-primary-foreground px-4 py-2 rounded-lg hover:bg-accent/90 font-sans"
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
