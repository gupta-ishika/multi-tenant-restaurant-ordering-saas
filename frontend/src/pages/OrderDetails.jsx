import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(fetchOrder, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  const updateOrderStatus = async (status) => {
    try {
      setError("");
      setSuccess("");
      setUpdatingStatus(true);

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        setError("Failed to update order status.");
        return;
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setSuccess("Order status updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-red-600">Order not found.</p>
      </div>
    );
  }

  const items = order.items || order.order_items || [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        to="/orders"
        className="mb-4 inline-block rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
      >
        ← Back to Orders
      </Link>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 text-green-600">
          {success}
        </p>
      )}

      <h1 className="mb-6 text-3xl font-bold">
        Order #{order.id}
      </h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-medium">Status:</span>

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

        <div>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={
              updatingStatus ||
              order.status === "Served" ||
              order.status === "Cancelled"
            }
            className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 font-normal"
          >
            <option value="Received">Received</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Served">Served</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {updatingStatus && (
            <p className="mt-1 text-xs text-gray-500">
              Updating status...
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <p>
          <span className="font-medium">Table:</span>{" "}
          {order.table_id}
        </p>

        {order.customer_name && (
          <p>
            <span className="font-medium">Customer:</span>{" "}
            {order.customer_name}
          </p>
        )}

        {order.created_at && (
          <p className="text-sm text-gray-500">
            Placed: {new Date(order.created_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Items
        </h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="border-b py-3 last:border-b-0"
          >
            <div className="flex justify-between">
              <span>
                {item.food_item?.name || `Food #${item.food_item_id}`} ×{" "}
                {item.quantity}
              </span>

              <span>₹{item.subtotal}</span>
            </div>

            {item.special_instructions && (
              <p className="mt-1 text-sm text-gray-500">
                Note: {item.special_instructions}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-400">
              ₹{item.price} each
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between rounded-lg border bg-white p-4 text-lg font-bold shadow-sm">
        <span>Total</span>
        <span>₹{order.total_price}</span>
      </div>

      <Link
        to="/orders"
        className="mt-6 inline-block rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
      >
        ← Back to Orders
      </Link>
    </div>
  );
}

export default OrderDetails;
