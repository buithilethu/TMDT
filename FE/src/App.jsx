import { useState } from 'react'
import './App.css'
import Header from './component/HomePage/Header'
import Footer from './component/HomePage/Footer'
import Slidener from './component/HomePage/Slidener'
import Center from './component/HomePage/Center'
import Dvu from './component/HomePage/Dvu'

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item._id === product._id);
      let newCartItems;
      
      if (itemExists) {
        newCartItems = prevItems.map((item) =>
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCartItems = [...prevItems, { ...product, quantity: 1 }];
      }
      
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return newCartItems;
    });
  };

  return (
    <>
      <div className="Container">
        <div className="Center">
          <Header cartItems={cartItems} />
          <Slidener />
          
          <Center cartItems={cartItems} addToCart={addToCart} />
          <Dvu />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default App