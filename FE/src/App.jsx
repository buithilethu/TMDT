import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './component/HomePage/Header';
import Footer from './component/HomePage/Footer';
import Slidener from './component/HomePage/Slidener';
import Center from './component/HomePage/Center';
import Dvu from './component/HomePage/Dvu';
const url = 'https://thuonggiaapi.ecotech2a.com';

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });

  // Sync cartItems to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm lấy token từ cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const addToCart = async (product) => {
    const token = getCookie('token');
    const newItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '/images/placeholder-image.jpg',
      quantity: 1,
      productId: product._id,
      variantId: product.variants?.[0]?._id || null,
    };

    if (token) {
      try {
        const response = await fetch(`${url}/v1/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            variantId: product.variants?.[0]?._id || null,
            quantity: 1,
          }),
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể thêm vào giỏ hàng');
        const addedItem = await response.json();
        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (i) => i.productId === product._id && i.variantId === newItem.variantId
          );
          if (existingItem) {
            return prevItems.map((i) =>
              i.productId === product._id && i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [...prevItems, { ...newItem, id: addedItem._id || product._id }];
        });
      } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
      }
    } else {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.productId === product._id && i.variantId === newItem.variantId
        );
        if (existingItem) {
          return prevItems.map((i) =>
            i.productId === product._id && i.variantId === newItem.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prevItems, newItem];
      });
    }
  };

  return (
    <div className="Container">
      <Header cartItems={cartItems} />
      <Slidener />
      <Center />
      <Dvu />
      <Outlet context={{ cartItems, setCartItems, addToCart }} />
      <Footer />
    </div>
  );
}

export default App;