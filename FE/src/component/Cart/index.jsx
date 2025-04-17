import React, { Fragment, useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

import { url } from '../data.js'

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const loadCartFromLocalStorage = () => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems));
    }
    setLoading(false);
  }

  useEffect(() => {
    const checkLoginAndFetchCart = async () => {
      try {
        const response = await fetch(`${url}/v1/cart`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          // Không đăng nhập => dùng localStorage
          loadCartFromLocalStorage();
          setIsLoggedIn(false);
          return;
        }

        if (!response.ok) throw new Error('Không thể tải giỏ hàng');

        const data = await response.json();
        setIsLoggedIn(true);

        const formattedItems = data.map((item) => ({
          id: item._id,
          quantity: item.quantity,
          price: item.variant?.price || item.product?.price,
          name: item.product?.name,
          image: item.images?.[0]?.url ? `${url}/${item.images[0].url}` : 'default-image.jpg',
          productSlug: item.product?.slug,
          variantId: item.variant?._id,
          attributes: item.variant?.attributes || {},
          stock: item.variant?.stock || 0,
        }));

        setCartItems(formattedItems);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkLoginAndFetchCart();
  }, []);


  const updateQuantity = async (id, quantity) => {
    const token = getCookie('token');
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);

    if (isLoggedIn && token) {
      try {
        const itemToUpdate = cartItems.find((item) => item.id === id);
        await fetch(`${url}/v1/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: newQuantity,
            variantId: itemToUpdate.variantId || 1,
          }),
          credentials: 'include',
        });
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
        await fetch(`${url}/v1/cart/deleteItem/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Lỗi khi xóa item:', err);
      }
    }

    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
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
        <Header />
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
                        <th className="variant-col">Biến thể</th>
                        <th className="price-col">Giá</th>
                        <th className="quantity-col">Số lượng</th>
                        <th className="stock-col">Tồn kho</th>
                        <th className="total-col">Tổng</th>
                        <th className="action-col">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        cartItems.reduce((grouped, item) => {
                          if (!grouped[item.name]) grouped[item.name] = [];
                          grouped[item.name].push(item);
                          return grouped;
                        }, {})
                      ).map(([productName, variants]) => (
                        <React.Fragment key={productName}>
                          <tr className="cart-row product-group-row">
                            <td className="product-cell" rowSpan={variants.length}>
                              <div className="product-info">
                                <Link to={`/product/${variants[0]?.productSlug}`}>
                                  <img
                                    src={variants[0].image}
                                    alt={productName}
                                    className="product-image"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'default-image.jpg';
                                    }}
                                  />
                                  <div className="product-details">
                                    <span className="product-name">{productName}</span>
                                  </div>
                                </Link>
                              </div>
                            </td>
                            {/* First variant in the group */}
                            <td className="variant-cell">
                              {Object.entries(variants[0].attributes).map(([key, value]) => (
                                <p key={key}><b>{key}:</b> {value}</p>
                              ))}
                            </td>
                            <td className="price-cell">
                              {variants[0].price.toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="quantity-cell">
                              <input
                                type="number"
                                min="1"
                                value={variants[0].quantity}
                                onChange={(e) => {
                                  if (e.target.value > variants[0].stock) {
                                    alert('Số lượng không đủ');
                                  } else if (e.target.value < 0) {
                                    alert('Số lượng không hợp lệ');
                                  }
                                  else {
                                    updateQuantity(variants[0].id, parseInt(e.target.value))
                                  }
                                }
                                }
                                className="quantity-input"
                              />
                            </td>
                            <td className="stock-cell">{variants[0].stock}</td>
                            <td className="total-cell">
                              {(variants[0].price * variants[0].quantity).toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="action-cell">
                              <button
                                onClick={() => removeItem(variants[0].id)}
                                className="remove-button"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>

                          {/* Render remaining variants without image/product name */}
                          {variants.slice(1).map((variant) => (
                            <tr key={variant.id} className="cart-row variant-row">
                              <td className="variant-cell">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                  <p key={key}><b>{key}:</b> {value}</p>
                                ))}
                              </td>
                              <td className="price-cell">
                                {variant.price.toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="quantity-cell">
                                <input
                                  type="number"
                                  min="1"

                                  value={variant.quantity}
                                  onChange={(e) => {
                                    if (e.target.value > variant.stock) {
                                      alert('Số lượng không đủ');
                                    } else if (e.target.value < 0) {
                                      alert('Số lượng không hợp lệ');
                                    } else {
                                      updateQuantity(variant.id, parseInt(e.target.value))
                                    }
                                  }
                                  }
                                  className="quantity-input"
                                />
                              </td>
                              <td className="stock-cell">{variant.stock}</td>
                              <td className="total-cell">
                                {(variant.price * variant.quantity).toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="action-cell">
                                <button
                                  onClick={() => removeItem(variant.id)}
                                  className="remove-button"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
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
                </div>
              </>
            ) : (
              <p>
                Giỏ hàng của bạn đang trống. <Link to="/">Mua sắm ngay</Link>
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
                    <td colSpan="2">
                      <h2>Tổng giỏ hàng</h2>
                    </td>
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
              <Link to="/Thanhtoan"><button className="Checkout">
                Tiến hành thanh toán
              </button></Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
