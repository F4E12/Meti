"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Order } from "@/lib/model/order";
import { User } from "@/lib/model/user";
import Header from "@/components/headers/header";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<"customer" | "tailor" | "loading">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
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

        // Fetch orders
        const ordersRes = await fetch("/api/orders", { method: "GET" });
        if (!ordersRes.ok) {
          setError("Failed to fetch orders");
          return;
        }
        const ordersData: { orders: Order[] } = await ordersRes.json();
        setOrders(ordersData.orders);
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      }
    };

    fetchUserAndOrders();
  }, []);

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (role === "loading") {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          My Orders
        </h1>
      </div>
      {error && <div className="text-destructive mb-4 font-sans">{error}</div>}
      {orders.length === 0 ? (
        <p className="text-muted-foreground font-sans">No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="border border-border/50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-serif font-semibold">
                  Order #{order.order_id.slice(0, 8)}
                </h2>
                <p className="text-muted-foreground font-sans">
                  Status: {order.status.toUpperCase()}
                </p>
                <p className="text-muted-foreground font-sans">
                  Ordered: {format(new Date(order.order_date), "PPP")}
                </p>
                {order.delivery_date && (
                  <p className="text-muted-foreground font-sans">
                    Delivery: {format(new Date(order.delivery_date), "PPP")}
                  </p>
                )}
                {role === "customer" && order.tailor && (
                  <p className="text-muted-foreground font-sans">
                    Tailor: {order.tailor.full_name} (Rating:{" "}
                    {order.tailor.rating})
                  </p>
                )}
                {role === "tailor" && order.customer && (
                  <p className="text-muted-foreground font-sans">
                    Customer: {order.customer.full_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleViewDetails(order.order_id)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-sans"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
