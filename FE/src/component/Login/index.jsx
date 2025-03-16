import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Login/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ cả hai trường');
      return;
    }

    try {
      // Đăng nhập
      const loginResponse = await fetch('http://localhost:3000/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        setErrorMessage(errorData.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        return;
      }

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Lấy thông tin user từ /v1/auth/me
      const userResponse = await fetch('http://localhost:3000/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Không thể lấy thông tin người dùng');
      }

      const userData = await userResponse.json();
      userData.accessToken = token; // Thêm token vào userData

      // Lưu thông tin user vào cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7, secure: true, sameSite: 'Strict' });

      // Chuyển hướng sang trang chủ
      navigate('/');
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi, vui lòng thử lại. ' + error.message);
    }
  };

  return (
    <div className="Login">
      <div className="header">
        <Header />
      </div>
      <div className="FormLogin">
        <div className="ImagePhone">
          <img src="/image/Singup/phone.png" alt="Biểu tượng điện thoại" />
        </div>
        <form id="Loginform" onSubmit={handleSubmit}>
          <div className="GroupLogIn">
            <div className="GroupTextLogin">
              <div className="Text1">Đăng nhập</div>
              <div className="Text2">Nhập thông tin của bạn dưới đây</div>
            </div>
            <div className="GroupInputLogin">
              <div className="Input1">
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="Input2">
                <input
                  type="password"
                  id="loginPassword"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="BtnLogIn">
            <button type="submit">Đăng nhập</button>
            <a href="#">Quên mật khẩu?</a>
          </div>
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      <Footer />
    </div>
  );
};

export default Login;