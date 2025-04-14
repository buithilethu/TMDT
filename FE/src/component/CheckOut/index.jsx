import { useState, useEffect } from 'react';
import './style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import axios from 'axios';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get('http://localhost:3000/v1/cart', { withCredentials: true });
        setCartItems(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
      }
    };

    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.variant.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/v1/payment/checkout`,
        {}, // Nếu có thêm thông tin như địa chỉ, phương thức thanh toán thì truyền ở đây
        { withCredentials: true }
      );

      // Nếu response có URL để chuyển hướng (ví dụ như PayOS):
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        console.log(res)
        alert('Đặt hàng thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Có lỗi xảy ra khi đặt hàng!');
    }
  };


  return (
    <div className="Checkout">
      <div className="header">
        <Header cartItems={cartItems} />
      </div>
      <hr />
      <div className="checkout">
        <div className="RoadMapCheckOut">
          <div className="Roadmap">
            <p className="home">Tài khoản</p>
            <p className="home">/</p>
            <p className="home">Tài khoản của tôi</p>
            <p className="home">/</p>
            <p className="home">Sản phẩm</p>
            <p className="home">/</p>
            <p className="home">Giỏ hàng</p>
            <p className="home">/</p>
            <p>Thanh toán</p>
          </div>
        </div>

        <div className="GroupCheckOut">
          <div className="BillingDetails">
            <h2>Thông tin thanh toán</h2>
            <div className="GroupInputCheck">
              {[
                { label: 'Họ', required: true },
                { label: 'Tên công ty (không bắt buộc)', required: false },
                { label: 'Địa chỉ', required: true },
                { label: 'Căn hộ, tầng, v.v. (không bắt buộc)', required: false },
                { label: 'Thành phố', required: true },
                { label: 'Số điện thoại', required: true },
                { label: 'Địa chỉ Email', type: 'email', required: true },
              ].map((input, index) => (
                <div className="Input" key={index}>
                  <label>
                    {input.label} {input.required && <b>*</b>}
                  </label>
                  <br />
                  <input type={input.type || 'text'} required={input.required} />
                </div>
              ))}
            </div>
          </div>

          <div className="Payment">
            <table>
              <tbody>
                {cartItems.map((item) => (
                  <tr className="tr" key={item._id}>
                    <td className="NameImg">
                      <img
                        src={`http://localhost:3000/${item.images[0]?.url}`}
                        alt={item.product.name}
                      />
                      <div>
                        <p>{item.product.name}</p>
                        <p className="variant">
                          {Object.entries(item.variant.attributes).map(([key, value]) => (
                            <span key={key}>{key}: {value} </span>
                          ))}
                        </p>
                        <p>Số lượng: {item.quantity}</p>
                      </div>
                    </td>
                    <td className="Price">
                      {(item.variant.price * item.quantity).toLocaleString()} VNĐ
                    </td>
                  </tr>
                ))}

                <tr className="hr">
                  <td className="Name">Tạm tính:</td>
                  <td className="Price">{totalPrice.toLocaleString()} VNĐ</td>
                </tr>

                <tr className="hr">
                  <td className="Name">Phí vận chuyển:</td>
                  <td className="Price">Miễn phí</td>
                </tr>

                <tr className="hr1">
                  <td className="Name">Tổng cộng:</td>
                  <td className="Price">{totalPrice.toLocaleString()} VNĐ</td>
                </tr>

                <tr className="banks">
                  <td className="bank">
                    <input name="paymentMethod" type="radio" value="Bank" /> Chuyển khoản ngân hàng
                  </td>
                </tr>

                <tr className="cash">
                  <td colSpan={2}>
                    <input name="paymentMethod" type="radio" value="Cash" /> Thanh toán khi nhận hàng
                  </td>
                </tr>

                <tr className="coupons">
                  <td>
                    <input type="text" placeholder="Mã giảm giá" />
                  </td>
                  <td>
                    <input type="button" value="Áp dụng mã" />
                  </td>
                </tr>

                <tr className="place">
                  <td colSpan={2}>
                    <button onClick={placeOrder}>Đặt hàng</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
