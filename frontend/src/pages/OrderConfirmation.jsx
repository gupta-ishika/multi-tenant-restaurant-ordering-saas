import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function OrderConfirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Order not found");
        }

        return response.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Order Placed!
          </h1>

          <p className="mt-2 text-gray-500">
            Order #{order.id}
          </p>

          <p className="mt-4 font-semibold">
            Status: {order.status}
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    Food Item #{item.food_item_id}
                  </p>

                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{item.subtotal}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>₹{order.total_price}</span>
          </div>
        </div>

        <Link
          to={`/menu/table/${order.table_id}`}
          className="mt-6 block rounded-xl bg-gray-900 py-3 text-center font-semibold text-white"
        >
          Back to Menu
        </Link>

      </div>
    </div>
  );
}

export default OrderConfirmation;
