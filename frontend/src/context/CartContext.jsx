import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("food_ordering_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "food_ordering_cart",
      JSON.stringify(cartItems)
    );
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
        },
      ];
    });
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

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}