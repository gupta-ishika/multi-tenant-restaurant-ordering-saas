import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        setError("Failed to fetch orders.");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        data.sort((a, b) => b.id - a.id);
        setOrders(data);
      }
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setError("");

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

      const data = await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: data.status }
            : order
        )
      );
    } catch {
      setError("Unable to connect to the server.");
    }
  };

  const statusCounts = {
    Received: orders.filter((order) => order.status === "Received").length,
    Preparing: orders.filter((order) => order.status === "Preparing").length,
    Ready: orders.filter((order) => order.status === "Ready").length,
    Served: orders.filter((order) => order.status === "Served").length,
    Cancelled: orders.filter((order) => order.status === "Cancelled").length,
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-gray-500">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="mb-4 rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
          >
            ↻ Refresh Orders
          </button>
        </div>

        {/* Status Summary & Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter("All")}
            className={`rounded border px-4 py-2 ${
              statusFilter === "All"
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            All: {orders.length}
          </button>

          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded border px-4 py-2 ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {status}: {count}
            </button>
          ))}
        </div>

        {/* Dropdown filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="mb-4 rounded border px-3 py-2"
        >
          <option value="All">All Orders</option>
          <option value="Received">Received</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option>
          <option value="Served">Served</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {error && (
          <p className="mb-4 text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-500">
            No {statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}orders found.
          </p>
        ) : (
          filteredOrders.map((order) => {
            const items = order.items || order.order_items || [];

            return (
              <div
                key={order.id}
                className="mb-4 rounded-lg border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Order #{order.id}
                  </h2>

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

                <p className="mt-2">
                  Table: {order.table_id}
                </p>

                {order.customer_name && (
                  <p className="text-sm text-gray-600">
                    Customer: {order.customer_name}
                  </p>
                )}

                {order.created_at && (
                  <p className="text-sm text-gray-500">
                    Placed: {new Date(order.created_at).toLocaleString()}
                  </p>
                )}

                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p>
                          {item.food_item?.name || `Food #${item.food_item_id}`} ×{" "}
                          {item.quantity}
                        </p>

                        {item.special_instructions && (
                          <p className="text-sm text-gray-500">
                            Note: {item.special_instructions}
                          </p>
                        )}

                        <p className="text-xs text-gray-400">
                          ₹{item.price} each
                        </p>
                      </div>

                      <span>₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t pt-2 font-bold">
                  <div>
                    Total: ₹{order.total_price}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={
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

                    <Link
                      to={`/orders/${order.id}`}
                      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 font-normal"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Orders;
