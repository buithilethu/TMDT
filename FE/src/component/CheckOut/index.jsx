import { useState, useEffect } from 'react';
import './style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import axios from 'axios';
import { url } from "../data.js";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Bank');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${url}/v1/cart`, { withCredentials: true });
        setCartItems(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${url}/v1/profile`, { withCredentials: true });
        const profile = res.data.result;
        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName || '',
          address: profile.address || '',
          phone: profile.phone || '',
        }));
        setProfileLoaded(true);
      } catch (error) {
        console.log('Không có thông tin người dùng, yêu cầu nhập thủ công.');
        setProfileLoaded(true);
      }
    };

    fetchCart();
    fetchProfile();
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async () => {
    const { fullName, address, phone } = formData;
    if (!fullName || !address || !phone) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const orderData = {
      userInfo: formData,
      cartItems,
      total: totalPrice,
      paymentMethod,
    };

    console.log('Dữ liệu gửi đi:', orderData); // 👈 In dữ liệu ra console

    try {
      const res = await axios.post(`${url}/v1/payment/checkout`, orderData, {
        withCredentials: true,
      });

      if (res?.data?.url && paymentMethod === 'Bank') {
        window.location.href = res.data.url;
      } else {
        alert('Đặt hàng thành công!');
        await axios.delete(`${url}/v1/cart/clear`, { withCredentials: true }); // 👈 Xoá giỏ hàng
        setCartItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Có lỗi xảy ra khi đặt hàng!');
    }
  };

  return (
    <div className="Checkout">
      <Header cartItems={cartItems} />
      <hr />
      <div className="checkout">
        <div className="RoadMapCheckOut">
          <div className="Roadmap">
            <p className="home">Tài khoản</p>
            <p className="home">/</p>
            <p className="home">Giỏ hàng</p>
            <p className="home">/</p>
            <p>Thanh toán</p>
          </div>
        </div>

        <div className="GroupCheckOut">
          <div className="BillingDetails">
            <h2>Thông tin thanh toán</h2>
            {profileLoaded ? (
              <div className="GroupInputCheck">
                {[
                  { label: 'Họ và tên', name: 'fullName', required: true },
                  { label: 'Địa chỉ', name: 'address', required: true },
                  { label: 'Số điện thoại', name: 'phone', required: true },
                ].map((input, idx) => (
                  <div className="Input" key={idx}>
                    <label>
                      {input.label} {input.required && <b>*</b>}
                    </label>
                    <br />
                    <input
                      name={input.name}
                      type="text"
                      value={formData[input.name] || ''}
                      onChange={handleChange}
                      required={input.required}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p>Đang tải thông tin...</p>
            )}
          </div>

          <div className="Payment">
            <table>
              <tbody>
                {cartItems.map((item) => (
                  <tr className="tr" key={item._id}>
                    <td className="NameImg">
                      <img src={`${url}/${item.images[0]?.url}`} alt={item.product.name} />
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
                    <input
                      name="paymentMethod"
                      type="radio"
                      value="Bank"
                      checked={paymentMethod === 'Bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    /> Chuyển khoản ngân hàng
                  </td>
                </tr>

                <tr className="cash">
                  <td colSpan={2}>
                    <input
                      name="paymentMethod"
                      type="radio"
                      value="Cash"
                      checked={paymentMethod === 'Cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    /> Thanh toán khi nhận hàng
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
