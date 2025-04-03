import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Cart/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, quantity) => {
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const subtotal = calculateSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  const handleUpdateCart = () => {
    console.log('Giỏ hàng đã được cập nhật:', cartItems);
  };

  return (
    <div className="Cart">
      <Header cartItems={cartItems} />
      <div className="cart">
        <div className="RoadMapCart">
          <div className="Roadmap">
            <Link to="/">
              <span className="home">Trang chủ</span>
            </Link>
            <span className="home">/</span>
            <Link to="/cart">
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
        <div className="ContentCart">
          <div className="GroupTable">
            {cartItems.length > 0 ? (
              <>
                <div className="cart-table-container">
  <table className="cart-table">
    <thead>
      <tr>
        <th className="product-col">Sản phẩm</th>
        <th className="price-col">Giá</th>
        <th className="quantity-col">Số lượng</th>
        <th className="total-col">Tổng</th>
        <th className="action-col">Hành động</th>
      </tr>
    </thead>
    <tbody>
      {cartItems.map((item) => (
        <tr key={item.id} className="cart-row">
          <td className="product-cell">
            <div className="product-info">
              <img 
                src={item.image} 
                alt={item.name}
                className="product-image"
              />
              <span className="product-name">{item.name}</span>
            </div>
          </td>
          <td className="price-cell">
            {item.price.toLocaleString('vi-VN', { currency: 'VND' })} VNĐ
          </td>
          <td className="quantity-cell">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              className="quantity-input"
            />
          </td>
          <td className="total-cell">
            {(item.price * item.quantity).toLocaleString('vi-VN', { currency: 'VND' })} VNĐ
          </td>
          <td className="action-cell">
            <button
              onClick={() => removeItem(item.id)}
              className="remove-button"
            >
              Xóa
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
                <div className="Update">
                  <Link to="/">
                    <button className="Return">
                      <b>Quay lại cửa hàng</b>
                    </button>
                  </Link>
                  <button className="Update" onClick={handleUpdateCart}>
                    <b>Cập nhật giỏ hàng</b>
                  </button>
                </div>
              </>
            ) : (
              <p>
                Giỏ hàng của bạn đang trống.{' '}
                <Link to="/">Mua sắm ngay</Link>
              </p>
            )}
          </div>
          <div className="GroupCart">
            <div className="Coupon">
              <input type="text" placeholder="Mã giảm giá" />
              <button className="Apply">Áp dụng mã</button>
            </div>
            <div className="CartTotal">
              <table className="CartTotal">
                <tbody className="tableCart">
                  <tr>
                    <h2>Tổng giỏ hàng</h2>
                  </tr>
                  <tr className="hr">
                    <td className="Name">Tạm tính:</td>
                    <td className="Price">{subtotal.toLocaleString()} VNĐ</td>
                  </tr>
                  <tr className="hr">
                    <td className="Name">Phí vận chuyển:</td>
                    <td className="Price">{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()} VNĐ`}</td>
                  </tr>
                  <tr className="hr">
                    <td className="Name">Tổng cộng:</td>
                    <td className="Price">{total.toLocaleString()} VNĐ</td>
                  </tr>
                </tbody>
              </table>
              <button className="Checkout">
                <Link to="/Thanhtoan">Tiến hành thanh toán</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;