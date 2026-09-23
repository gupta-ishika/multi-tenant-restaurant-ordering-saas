import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API_BASE_URL from "../services/api";

function Cart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlTableId = searchParams.get("table_id");

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    updateSpecialInstructions,
    cartTableId,
  } = useCart();

  const tableId = urlTableId || cartTableId;

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const placeOrder = async () => {
    if (!tableId) {
      setOrderError("Table information is missing.");
      return;
    }

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);
    setOrderError("");

    try {
      const response = await fetch(`${API_BASE_URL}/public/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_id: Number(tableId),
          items: cartItems.map((item) => ({
            food_item_id: item.id,
            quantity: item.quantity,
            special_instructions: item.special_instructions?.trim() || null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to place order.");
      }

      clearCart();

      navigate(`/orders/track/${data.id}`);
    } catch (error) {
      setOrderError(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!tableId) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Invalid Order</h1>
        <p className="mt-2 text-gray-600">
          This cart is not associated with a restaurant table. Please scan a table QR code.
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-semibold text-gray-600">
          Your cart is empty
        </h1>
        <Link
          to={`/menu/table/${tableId}`}
          className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 font-medium text-white hover:bg-black"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart
          </h1>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
            Table #{tableId}
          </span>
        </div>

        {orderError && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">
            {orderError}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    ₹{item.price} each
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>

              {/* Special Instructions */}
              <textarea
                value={item.special_instructions || ""}
                onChange={(e) =>
                  updateSpecialInstructions(
                    item.id,
                    e.target.value
                  )
                }
                placeholder="Special instructions (optional, e.g. Less spicy, No onions)"
                className="mt-3 w-full rounded-md border border-gray-200 p-2 text-sm outline-none focus:border-gray-400"
                rows="2"
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-8 w-8 rounded-lg bg-gray-200 font-bold hover:bg-gray-300"
                  >
                    −
                  </button>

                  <span className="font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="h-8 w-8 rounded-lg bg-gray-900 text-white font-bold hover:bg-black"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex justify-between text-gray-600">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={placingOrder || cartItems.length === 0}
            className="mt-4 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;