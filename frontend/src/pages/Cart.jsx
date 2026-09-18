import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-600">
          Your cart is empty
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          Your Cart
        </h1>

        <div className="mt-6 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    ₹{item.price} each
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{item.price * item.quantity}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => decreaseQuantity(item.id)}
                  className="h-8 w-8 rounded-lg bg-gray-200"
                >
                  −
                </button>

                <span className="font-semibold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  className="h-8 w-8 rounded-lg bg-gray-900 text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="mt-3 text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
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
            className="mt-4 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;