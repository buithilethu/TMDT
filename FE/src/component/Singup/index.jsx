import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Singup/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import { Link } from 'react-router-dom';

const Singup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate(); // Hook để điều hướng

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Không thể tạo tài khoản. Vui lòng thử lại sau.');
        return;
      }

      const data = await response.json();
      console.log('Đăng ký thành công:', data);

      // Chuyển hướng sang trang chủ sau khi đăng ký thành công
      navigate('/');
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi, vui lòng thử lại sau. ' + error.message);
    }
  };

  return (
    <div className="Singup">
      <div className="header">
        <Header />
      </div>
      <div className="FormSignUp">
        <div className="ImageSignUp">
          <img src="/image/Singup/phone.png" alt="Biểu tượng điện thoại" />
        </div>
        <form id="Singupform" onSubmit={handleSubmit}>
          <div className="GroupTextSign">
            <div className="TextS1">Tạo tài khoản</div>
            <div className="TextS2">Nhập thông tin của bạn dưới đây</div>
          </div>
          <div className="GroupBtnSign">
            <div className="GroupInput">
              <input
                type="text"
                id="SignFirstName"
                placeholder="Họ"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                id="SignLastName"
                placeholder="Tên"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="email"
                id="SignEmail"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                id="SignPassword"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="BtnCreate">
              <div className="Create">
                <button type="submit">Tạo tài khoản</button>
              </div>
              <div className="GroupDownSing">
                <div className="googleSingin">
                  <img src="/image/Singup/Icon-Google.png" alt="Biểu tượng Google" />
                  <a href="https://www.google.com/">Đăng ký bằng Google</a>
                </div>
                <div className="Singin">
                  Đã có tài khoản? <Link to="/Dangnhap">Đăng nhập</Link>
                </div>
              </div>
            </div>
          </div>
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      <Footer />
    </div>
  );
};

export default Singup;