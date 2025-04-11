import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './style.css';
const url = 'https:localhost:3000'
const Cart = () => {
  const context = useOutletContext();
  const { cartItems = [], setCartItems } = context || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchCartItems = async (token) => {
    try {
      const response = await fetch(`${url}/v1/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Không thể tải giỏ hàng');
      }

      const data = await response.json();
      const formattedItems = data.map((item) => ({
        id: item._id,
        quantity: item.quantity,
        price: item.variant?.price || item.product?.price,
        name: item.product?.name,
        image: item.product?.images?.[0]?.url || 'default-image.jpg',
        productId: item.product?._id,
        variantId: item.variant?._id,
      }));

      setCartItems(formattedItems);
    } catch (err) {
      setError(err.message);
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromLocalStorage = () => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems));
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkLoginAndFetchCart = async () => {
      const token = getCookie('token');
      if (token) {
        setIsLoggedIn(true);
        await fetchCartItems(token);
      } else {
        setIsLoggedIn(false);
        loadCartFromLocalStorage();
      }
    };

    checkLoginAndFetchCart();
  }, [setCartItems]);

  const updateQuantity = async (id, quantity) => {
    const token = getCookie('token');
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);

    if (isLoggedIn && token) {
      try {
        const itemToUpdate = cartItems.find((item) => item.id === id);
        const response = await fetch(`${url}/v1/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [
              {
                _id: id,
                quantity: newQuantity,
                productId: itemToUpdate.productId,
                variantId: itemToUpdate.variantId || null,
              },
            ],
          }),
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể cập nhật số lượng');
      } catch (err) {
        console.error('Lỗi khi cập nhật số lượng:', err);
      }
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = async (id) => {
    const token = getCookie('token');
    if (isLoggedIn && token) {
      try {
        const response = await fetch(`${url}/v1/cart/deleteItem/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể xóa sản phẩm');
      } catch (err) {
        console.error('Lỗi khi xóa item:', err);
      }
    }
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleUpdateCart = async () => {
    const token = getCookie('token');
    if (isLoggedIn && token) {
      try {
        const response = await fetch(`${url}/v1/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              _id: item.id,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
            })),
          }),
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể cập nhật giỏ hàng');
        console.log('Giỏ hàng đã được cập nhật:', cartItems);
      } catch (err) {
        console.error('Lỗi khi cập nhật giỏ hàng:', err);
      }
    }
  };

  const calculateSubtotal = () =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const subtotal = calculateSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="Carts">
      <div className="cart">
        <div className="RoadMapCart">
          <div className="Roadmap">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/Giohang">Giỏ hàng</Link>
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
                                onError={(e) => (e.target.src = 'default-image.jpg')}
                              />
                              <span className="product-name">{item.name}</span>
                            </div>
                          </td>
                          <td className="price-cell">
                            {item.price.toLocaleString('vi-VN', {
                              currency: 'VND',
                            })}{' '}
                            VNĐ
                          </td>
                          <td className="quantity-cell">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value))
                              }
                              className="quantity-input"
                            />
                          </td>
                          <td className="total-cell">
                            {(item.price * item.quantity).toLocaleString(
                              'vi-VN',
                              { currency: 'VND' }
                            )}{' '}
                            VNĐ
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
                    <td className="Price">
                      {shipping === 0
                        ? 'Miễn phí'
                        : `${shipping.toLocaleString()} VNĐ`}
                    </td>
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
    </div>
  );
};

export default Cart;