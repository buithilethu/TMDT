import { useState, useEffect } from 'react';
import './style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import axios from 'axios';
import { url } from "../data.js"
const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    paymentMethod: 'Banking',
  });

  const [profileLoaded, setProfileLoaded] = useState(false);

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

    try {
      const res = await axios.post(
        `${url}/v1/payment/checkout`,
        formData,
        { withCredentials: true }
      );

      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Đặt hàng thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Có lỗi xảy ra khi đặt hàng!');
    }
  };

  const groupedCartItems = Object.values(
    cartItems.reduce((acc, item) => {
      const productId = item.product._id;
      if (!acc[productId]) {
        acc[productId] = {
          ...item,
          variants: [{ ...item.variant, quantity: item.quantity }],
        };
      } else {
        acc[productId].variants.push({ ...item.variant, quantity: item.quantity });
      }
      return acc;
    }, {})
  );


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
                      type={input.name === 'email' ? 'email' : 'text'}
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
                {groupedCartItems.map((item) => (
                  <tr className="tr" key={item.product._id}>
                    <td className="NameImg">
                      <img src={`${url}/${item.images[0]?.url}`} alt={item.product.name} />
                      <div>
                        <p><strong>{item.product.name}</strong></p>
                        {item.variants.map((variant, idx) => (
                          <div key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                            <p className="variant">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key}>{key}: {value} </span>
                              ))}
                            </p>
                            <p>Số lượng: {variant.quantity}</p>
                            <p>Giá: {(variant.price * variant.quantity).toLocaleString()} VNĐ</p>
                            {idx == item.variants.length - 2 && <hr style={{ margin: '0.5rem 0' }} />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="Price">
                      <strong>
                        Tổng: {item.variants
                          .reduce((total, variant) => total + variant.price * variant.quantity, 0)
                          .toLocaleString()} VNĐ
                      </strong>
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
                    <label>
                      <input
                        name="paymentMethod"
                        type="radio"
                        value="Banking"
                        checked={formData.paymentMethod === 'Banking'}
                        onChange={handleChange}
                      />{' '}
                      Chuyển khoản ngân hàng (PayOS)
                    </label>
                  </td>
                </tr>

                <tr className="cash">
                  <td className="bank">
                    <label>
                      <input
                        name="paymentMethod"
                        type="radio"
                        value="Cash"
                        checked={formData.paymentMethod === 'Cash'}
                        onChange={handleChange}
                      />{' '}
                      Thanh toán khi nhận hàng (COD)
                    </label>
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
