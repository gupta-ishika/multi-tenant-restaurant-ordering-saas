import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartTableId, setCartTableId] = useState(() => {
    return localStorage.getItem("cart_table_id") || localStorage.getItem("food_ordering_table_id");
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart") || localStorage.getItem("food_ordering_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const setTableForCart = (tableId) => {
    const stringId = tableId ? String(tableId) : null;
    setCartTableId(stringId);
    if (stringId) {
      localStorage.setItem("cart_table_id", stringId);
      localStorage.setItem("food_ordering_table_id", stringId);
    } else {
      localStorage.removeItem("cart_table_id");
      localStorage.removeItem("food_ordering_table_id");
    }
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    localStorage.setItem("food_ordering_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (foodItem) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === foodItem.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === foodItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...foodItem,
          quantity: 1,
          special_instructions: foodItem.special_instructions || "",
        },
      ];
    });
  };

  const updateSpecialInstructions = (foodItemId, instructions) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === foodItemId
          ? {
              ...item,
              special_instructions: instructions,
            }
          : item
      )
    );
  };

  const increaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTableId(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_table_id");
    localStorage.removeItem("food_ordering_cart");
    localStorage.removeItem("food_ordering_table_id");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        updateSpecialInstructions,
        cartTableId,
        tableId: cartTableId,
        setTableForCart,
        setCartTable: setTableForCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}