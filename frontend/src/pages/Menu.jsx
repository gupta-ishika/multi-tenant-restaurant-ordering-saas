import { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

function Menu() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [foodItems, setFoodItems] = useState([]);
  const [loadingFoodItems, setLoadingFoodItems] = useState(true);
  const [foodForm, setFoodForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_veg: true,
  });
  const [addingFoodItem, setAddingFoodItem] = useState(false);
  const [foodError, setFoodError] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setFoodItems(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch food items:", err);
    } finally {
      setLoadingFoodItems(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFoodItems();
  }, []);

  const createCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    setAddingCategory(true);
    setCategoryError("");

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: categoryName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category.");
      }

      const newCategory = await response.json();
      setCategories((current) => [...current, newCategory]);
      setCategoryName("");
    } catch (error) {
      setCategoryError(error.message);
    } finally {
      setAddingCategory(false);
    }
  };

  const toggleCategory = async (category) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            is_active: !category.is_active,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category.");
      }

      const updatedCategory = await response.json();

      setCategories((current) =>
        current.map((item) =>
          item.id === updatedCategory.id ? updatedCategory : item
        )
      );
    } catch (error) {
      setCategoryError(error.message);
    }
  };

  const createFoodItem = async () => {
    if (
      !foodForm.name.trim() ||
      !foodForm.price ||
      !foodForm.category_id
    ) {
      setFoodError("Name, price, and category are required.");
      return;
    }

    setAddingFoodItem(true);
    setFoodError("");

    try {
      const response = await fetch(`${API_BASE_URL}/food-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: foodForm.name.trim(),
          description: foodForm.description.trim() || null,
          price: Number(foodForm.price),
          category_id: Number(foodForm.category_id),
          is_veg: foodForm.is_veg,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create food item.");
      }

      const newFoodItem = await response.json();

      setFoodItems((current) => [...current, newFoodItem]);

      setFoodForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        is_veg: true,
      });
    } catch (error) {
      setFoodError(error.message);
    } finally {
      setAddingFoodItem(false);
    }
  };

  const toggleFoodAvailability = async (item) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/food-items/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            is_available: !item.is_available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update availability.");
      }

      const updatedItem = await response.json();

      setFoodItems((current) =>
        current.map((food) =>
          food.id === updatedItem.id ? updatedItem : food
        )
      );
    } catch (error) {
      setFoodError(error.message);
    }
  };

  const activeCategories = categories.filter((cat) => cat.is_active);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
      <p className="mt-2 text-gray-500">
        Manage your restaurant menu categories and food items.
      </p>

      {/* Categories Section */}
      <div className="mt-8 border-b pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Categories
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="rounded-md border px-3 py-2 text-sm"
            />

            <button
              onClick={createCategory}
              disabled={addingCategory}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addingCategory ? "Adding..." : "Add Category"}
            </button>
          </div>
        </div>

        {categoryError && (
          <p className="mt-2 text-sm text-red-600">
            {categoryError}
          </p>
        )}

        <div className="mt-4">
          {loadingCategories ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        category.is_active
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>

                    <button
                      onClick={() => toggleCategory(category)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {category.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food Items Section */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Food Items
          </h2>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Food name"
              value={foodForm.name}
              onChange={(e) =>
                setFoodForm({ ...foodForm, name: e.target.value })
              }
              className="rounded-md border px-3 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Price"
              value={foodForm.price}
              onChange={(e) =>
                setFoodForm({ ...foodForm, price: e.target.value })
              }
              className="w-28 rounded-md border px-3 py-2 text-sm"
            />

            <select
              value={foodForm.category_id}
              onChange={(e) =>
                setFoodForm({
                  ...foodForm,
                  category_id: e.target.value,
                })
              }
              disabled={activeCategories.length === 0}
              className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">
                {activeCategories.length === 0
                  ? "Create a category first"
                  : "Select category"}
              </option>

              {activeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              onClick={createFoodItem}
              disabled={addingFoodItem}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addingFoodItem ? "Adding..." : "Add Food Item"}
            </button>
          </div>
        </div>

        {foodError && (
          <p className="mt-2 text-sm text-red-600">
            {foodError}
          </p>
        )}

        <div className="mt-6">
          {loadingFoodItems ? (
            <p className="text-gray-500">Loading food items...</p>
          ) : foodItems.length === 0 ? (
            <p className="text-gray-500">No food items found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {categories.find((c) => c.id === item.category_id)?.name ||
                      "Unknown category"}
                  </p>

                  {item.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {item.description}
                    </p>
                  )}

                  <p className="mt-3 text-lg font-semibold text-gray-900">
                    ₹{Number(item.price).toFixed(2)}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.is_veg ? "Veg" : "Non-Veg"}
                  </p>

                  <p
                    className={`mt-1 text-sm font-medium ${
                      item.is_available ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </p>

                  <button
                    onClick={() => toggleFoodAvailability(item)}
                    className="mt-3 rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    {item.is_available ? "Mark Unavailable" : "Mark Available"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Menu;
