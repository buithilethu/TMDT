import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Login/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate(); // Hook điều hướng

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone || !password) {
      setErrorMessage('Vui lòng điền đầy đủ cả hai trường');
      return;
    }

    try {
      const response = await fetch('https://677e3faf94bde1c1252b16ee.mockapi.io/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setErrorMessage('Không thể kết nối đến máy chủ');
        return;
      }

      const data = await response.json();
      console.log('Dữ liệu:', data);

      // Kiểm tra xem người dùng có tồn tại và mật khẩu có khớp không
      const user = data.find(
        (user) => user.emailOrPhone === emailOrPhone && user.password === password
      );

      if (user) {
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('user', JSON.stringify(user));

        // Chuyển hướng sang trang chủ
        navigate('/');
      } else {
        setErrorMessage('Email/số điện thoại hoặc mật khẩu không đúng');
      }
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi, vui lòng thử lại');
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
              <div className="Text1">Đăng nhập  </div>
              <div className="Text2">Nhập thông tin của bạn dưới đây</div>
            </div>
            <div className="GroupInputLogin">
              <div className="Input1">
                <input
                  type="text"
                  id="loginEmailOrPhone"
                  placeholder="Email "
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
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
            <button type="submit">Đăng Nhập</button>
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