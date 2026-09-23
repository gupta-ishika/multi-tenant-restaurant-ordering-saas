import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

const statuses = [
  "Received",
  "Preparing",
  "Ready",
  "Served",
];

function OrderTracking() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/public/orders/${orderId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load order.");
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600 font-medium">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);
  const items = order.items || order.order_items || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-gray-500">
                Table #{order.table_id}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                order.status === "Received"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "Preparing"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "Ready"
                  ? "bg-green-100 text-green-700"
                  : order.status === "Served"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {order.created_at && (
            <p className="mt-3 text-sm text-gray-500">
              Placed at {new Date(order.created_at).toLocaleString()}
            </p>
          )}

          {/* Cancelled Banner */}
          {order.status === "Cancelled" && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-700">
                This order has been cancelled.
              </p>
            </div>
          )}

          {/* Normal Status Progression Timeline */}
          {order.status !== "Cancelled" && (
            <div className="mt-6 border-t pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Order Status
              </p>
              <div className="space-y-3">
                {statuses.map((status, index) => {
                  const completed = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={status}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`h-4 w-4 rounded-full transition-colors ${
                          completed
                            ? "bg-green-500"
                            : "bg-gray-300"
                        } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                      />

                      <p
                        className={
                          completed
                            ? "font-medium text-green-800"
                            : "text-gray-400"
                        }
                      >
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Order status updates automatically every 5 seconds.
          </p>
        </div>

        {/* Order Items Card */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Items
          </h2>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.food_item?.name || `Food #${item.food_item_id}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  {item.special_instructions && (
                    <p className="mt-1 text-sm text-amber-700 font-medium">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>

                <p className="font-semibold text-gray-900">
                  ₹{Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>₹{Number(order.total_price).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Link */}
        <Link
          to={`/menu/table/${order.table_id}`}
          className="mt-6 block rounded-xl bg-gray-900 py-3 text-center font-semibold text-white hover:bg-black"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  );
}

export default OrderTracking;
