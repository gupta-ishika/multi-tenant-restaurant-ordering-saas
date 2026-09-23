import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setOrders(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const receivedOrders = orders.filter((order) => order.status === "Received").length;
  const preparingOrders = orders.filter((order) => order.status === "Preparing").length;
  const readyOrders = orders.filter((order) => order.status === "Ready").length;
  const servedOrders = orders.filter((order) => order.status === "Served").length;
  const cancelledOrders = orders.filter((order) => order.status === "Cancelled").length;
  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_price || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-500">
        Welcome to your restaurant dashboard.
      </p>

      {/* Statistics Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-2 text-2xl font-bold">
            {loading ? "..." : totalOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Received</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {loading ? "..." : receivedOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Preparing</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {loading ? "..." : preparingOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ready</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {loading ? "..." : readyOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Served</p>
          <p className="mt-2 text-2xl font-bold text-gray-700">
            {loading ? "..." : servedOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {loading ? "..." : cancelledOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm sm:col-span-2">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {loading ? "..." : `₹${totalRevenue.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Quick Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            View Orders
          </Link>

          <Link
            to="/menu"
            className="rounded-md border bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Manage Menu
          </Link>

          <Link
            to="/tables"
            className="rounded-md border bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Manage Tables
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Orders
          </h2>

          <Link
            to="/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Order #{order.id}
                  </p>

                  <p className="text-sm text-gray-500">
                    Table {order.table_id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₹{order.total_price}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
