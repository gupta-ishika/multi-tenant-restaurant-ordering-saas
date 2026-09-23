import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import API_BASE_URL from "./services/api";
import TableMenu from "./pages/TableMenu";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hello`)
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        {message}
      </h1>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu/table/:tableId" element={<TableMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;