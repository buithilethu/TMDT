import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Singup/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import {url} from '../data.js'
 const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await fetch(`${url}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }

      const data = await response.json();
      console.log('Đăng ký thành công:', data);

      // Tạo userData từ dữ liệu đầu vào và phản hồi API (nếu có)
      const userData = {
        firstName,
        lastName,
        email,
        ...(data.user || {}), // Nếu API trả về thông tin user
        accessToken: data.accessToken || null, // Lưu token nếu API trả về
      };

      // Lưu thông tin vào cookie
      Cookies.set('user', JSON.stringify(userData), {
        expires: 2,
        secure: true,
        sameSite: 'Strict',
      });

      // Chuyển hướng sang trang chủ
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setErrorMessage(error.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    }
  };

  return (
    <div className="Singup">
      <div className="header"><Header /></div>
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

export default Signup;