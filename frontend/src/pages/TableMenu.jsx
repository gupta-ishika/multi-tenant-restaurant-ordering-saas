import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import { useCart } from "../context/CartContext";

function TableMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const {
    cartItems,
    addToCart,
    clearCart,
    cartTableId,
    setTableForCart,
  } = useCart();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showTableChangeWarning, setShowTableChangeWarning] = useState(false);

  // Establish table context if none is active
  useEffect(() => {
    if (!tableId) {
      return;
    }

    if (!cartTableId) {
      setTableForCart(tableId);
    }
  }, [tableId, cartTableId, setTableForCart]);

  // Detect table conflict when cart has items for another table
  useEffect(() => {
    if (!tableId || !cartTableId) {
      return;
    }

    if (String(cartTableId) !== String(tableId) && cartItems.length > 0) {
      setShowTableChangeWarning(true);
    } else {
      setShowTableChangeWarning(false);
    }
  }, [tableId, cartTableId, cartItems.length]);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/public/menu/${tableId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the menu.");
        }
        return response.json();
      })
      .then((data) => {
        setMenu(data);
      })
      .catch((err) => {
        setError(err.message || "Unable to load the menu.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tableId]);

  const canAddToCart =
    !cartTableId ||
    String(cartTableId) === String(tableId);

  const handleAddToCart = (item) => {
    if (!canAddToCart) {
      setShowTableChangeWarning(true);
      return;
    }

    if (!cartTableId) {
      setTableForCart(tableId);
    }

    addToCart(item);
  };

  const handleStartNewCart = () => {
    clearCart();
    setTableForCart(tableId);
    setShowTableChangeWarning(false);
  };

  const handleContinuePreviousTable = () => {
    navigate(`/menu/table/${cartTableId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading restaurant menu...</p>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="mx-auto max-w-xl p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Table unavailable
          </h1>
          <p className="mt-2 text-gray-500">
            This table is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const categories = menu.categories || [];
  const filteredCategories = categories
    .filter(
      (category) =>
        selectedCategory === "all" ||
        String(selectedCategory) === String(category.category_id)
    )
    .map((category) => ({
      ...category,
      food_items: (category.food_items || []).filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((category) => category.food_items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md px-6 py-4 shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menu.restaurant_name}
            </h1>
            <p className="text-xs font-medium text-emerald-700">
              Table #{menu.table_number || tableId}
            </p>
          </div>

          <Link
            to={`/cart?table_id=${cartTableId || tableId}`}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            <span>View Cart ({cartCount})</span>
          </Link>
        </div>
      </header>

      {/* Customer Menu Content */}
      <main className="mx-auto max-w-4xl px-6 py-6">
        {/* Table Change Warning Banner */}
        {showTableChangeWarning && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-yellow-900">
                  You already have items from another table.
                </p>
                <p className="mt-1 text-sm text-yellow-700">
                  Your current cart belongs to Table #{cartTableId}. Items from Table #{tableId} cannot be mixed.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleContinuePreviousTable}
                className="rounded-lg bg-yellow-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-yellow-900"
              >
                Continue Table #{cartTableId}
              </button>
              <button
                onClick={handleStartNewCart}
                className="rounded-lg border border-yellow-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-yellow-900 hover:bg-yellow-100"
              >
                Start New Cart for Table #{tableId}
              </button>
            </div>
          </div>
        )}

        {/* Live Search */}
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-400"
        />

        {/* Category Pill Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategory(category.category_id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
                String(selectedCategory) === String(category.category_id)
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.category_name}
            </button>
          ))}
        </div>

        {/* Menu Items Grouped By Categories */}
        <div className="mt-8 space-y-8">
          {filteredCategories.map((category) => (
            <section key={category.category_id}>
              <h2 className="text-xl font-bold text-gray-900">
                {category.category_name}
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {category.food_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.is_veg !== undefined && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              item.is_veg
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.is_veg ? "🟢 Veg" : "🔴 Non-Veg"}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <p className="mt-2 text-sm font-bold text-gray-900">
                        ₹{Number(item.price).toFixed(2)}
                      </p>

                      {item.is_available === false && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Currently unavailable
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.is_available === false}
                        className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {item.is_available === false ? "Unavailable" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Empty Search Result */}
        {filteredCategories.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p className="text-sm">No food items found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default TableMenu;