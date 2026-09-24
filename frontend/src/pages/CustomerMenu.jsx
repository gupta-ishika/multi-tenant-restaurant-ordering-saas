import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BACKEND_URL = "http://127.0.0.1:8000";

function CustomerMenu() {
  const { restaurantId, tableId } = useParams();

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState({
    restaurantId: Number(restaurantId),
    tableId: Number(tableId),
    items: [],
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    // Reset cart context if params change
    setCart({
      restaurantId: Number(restaurantId),
      tableId: Number(tableId),
      items: [],
    });
    setOrder(null);
    setOrderError("");

    const fetchTableAndMenu = async () => {
      setLoading(true);
      setError("");

      try {
        const tableResponse = await fetch(
          `${BACKEND_URL}/public/restaurants/${restaurantId}/tables/${tableId}`
        );

        const tableData = await tableResponse.json();

        if (!tableResponse.ok) {
          throw new Error(
            tableData.detail || "Unable to access this table"
          );
        }

        setTable(tableData);

        const menuResponse = await fetch(
          `${BACKEND_URL}/public/restaurants/${restaurantId}/menu`
        );

        const menuData = await menuResponse.json();

        if (!menuResponse.ok) {
          throw new Error(
            menuData.detail || "Unable to load menu"
          );
        }

        setMenu(menuData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTableAndMenu();
  }, [restaurantId, tableId]);

  const addToCart = (food) => {
    setCart((currentCart) => {
      const existingItem = currentCart.items.find(
        (item) => item.id === food.id
      );

      if (existingItem) {
        return {
          ...currentCart,
          items: currentCart.items.map((item) =>
            item.id === food.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      }

      return {
        ...currentCart,
        items: [
          ...currentCart.items,
          {
            ...food,
            quantity: 1,
          },
        ],
      };
    });
  };

  const increaseQuantity = (foodId) => {
    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.map((item) =>
        item.id === foodId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      ),
    }));
  };

  const decreaseQuantity = (foodId) => {
    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items
        .map((item) =>
          item.id === foodId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  };

  const cartTotal = cart.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);
    setOrderError("");

    try {
      const payload = {
        table_id: cart.tableId,
        items: cart.items.map((item) => ({
          food_item_id: item.id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || null,
        })),
      };

      const response = await fetch(
        `${BACKEND_URL}/public/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to place order"
        );
      }

      setOrder(data);

      setCart((currentCart) => ({
        ...currentCart,
        items: [],
      }));
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">
          {menu?.restaurant_name || "Restaurant Menu"}
        </h1>

        {table && (
          <p className="mt-1 text-sm font-medium text-gray-500">
            Table {table.table_number}
          </p>
        )}

        {/* Menu Categories */}
        <div className="mt-6 space-y-6">
          {menu?.categories?.map((category) => (
            <div key={category.id} className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-1">
                {category.name}
              </h2>

              <div className="space-y-3">
                {category.food_items?.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{food.name}</h3>
                      {food.description && (
                        <p className="text-xs text-gray-500">{food.description}</p>
                      )}
                      <p className="mt-1 font-semibold text-gray-800">
                        ₹{food.price}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(food)}
                      disabled={!food.is_available}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {food.is_available ? "Add to Cart" : "Unavailable"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Cart</h2>

          {cart.items.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="h-7 w-7 rounded bg-gray-200 font-bold hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="w-6 text-center font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="h-7 w-7 rounded bg-gray-900 text-white font-bold hover:bg-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 flex items-center justify-between pt-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Total: ₹{cartTotal.toFixed(2)}
                </h3>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || cart.items.length === 0}
                  className="rounded-xl bg-gray-900 px-6 py-2.5 font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}

          {orderError && (
            <p className="mt-3 text-sm text-red-600 font-medium">
              {orderError}
            </p>
          )}
        </div>

        {/* Order Confirmation */}
        {order && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-6">
            <h2 className="text-xl font-bold text-green-800">
              Order Placed!
            </h2>
            <p className="mt-2 text-sm text-green-700">
              Order #{order.id}
            </p>
            <p className="text-sm text-green-700">
              Status: {order.status}
            </p>
            <p className="font-semibold text-green-800 mt-1">
              Total: ₹{order.total_price}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerMenu;
