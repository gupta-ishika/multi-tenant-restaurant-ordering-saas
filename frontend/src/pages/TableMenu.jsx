import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API_BASE_URL from "../services/api";
import { useCart } from "../context/CartContext";

function TableMenu() {
    const { tableId } = useParams();
    const { cartItems, addToCart } = useCart();

    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        fetch(`${API_BASE_URL}/public/menu/${tableId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Menu not found");
                }

                return response.json();
            })
            .then((data) => {
                setMenu(data);
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [tableId]);

    if (loading) {
        return <div className="p-8">Loading menu...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    const filteredCategories = menu.categories
        .filter(
            (category) =>
                selectedCategory === "all" ||
                selectedCategory === category.category_id
        )
        .map((category) => ({
            ...category,
            food_items: category.food_items.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter((category) => category.food_items.length > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-6 shadow-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {menu.restaurant_name}
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Table {menu.table_number}
                        </p>
                    </div>

                    <Link
                        to="/cart"
                        className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        View Cart (
                        {cartItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                        )}
                        )
                    </Link>
                </div>
            </div>

            {/* Menu Content */}
            <div className="mx-auto max-w-4xl px-6 py-6">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search food..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-gray-500"
                />

                {/* Category Filter */}
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className="whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 text-sm text-white"
                    >
                        All
                    </button>

                    {menu.categories.map((category) => (
                        <button
                            key={category.category_id}
                            onClick={() => setSelectedCategory(category.category_id)}
                            className="whitespace-nowrap rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700"
                        >
                            {category.category_name}
                        </button>
                    ))}
                </div>

                {/* Categories */}
                <div className="mt-8 space-y-8">
                    {filteredCategories.map((category) => (
                        <section key={category.category_id}>

                            <h2 className="text-2xl font-bold text-gray-900">
                                {category.category_name}
                            </h2>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {category.food_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>

                                                {item.description && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="whitespace-nowrap font-semibold text-gray-900">
                                                ₹{item.price}
                                            </p>

                                            <button
                                                onClick={() => addToCart(item)}
                                                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
                                            >Add to cart</button>

                                        </div>
                                    </div>
                                ))}
                            </div>

                        </section>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCategories.length === 0 && (
                    <p className="mt-12 text-center text-gray-500">
                        No food items found.
                    </p>
                )}

            </div>
        </div>
    );
}

export default TableMenu;