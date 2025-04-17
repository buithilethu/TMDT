import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Login/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import { url } from '../data.js'
import axios from 'axios';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Email không hợp lệ');
      return;
    }

    try {
      const res = await axios.post(
        `${url}/v1/auth/login`,
        {
          withCredentials: true,
          body: {
            email,
            password,
          },
        }
      )
      return res
    } catch (error) {
      console.log(error)
    }
  }

  // try {
  //   const loginResponse = await fetch(`${url}/v1/auth/login`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password }),
  //     credentials: 'include',
  //   });

  //   if (!loginResponse.ok) {
  //     const errorData = await loginResponse.json();
  //     throw new Error(errorData.message || 'Đăng nhập thất bại');
  //   }

  //   const loginData = await loginResponse.json();
  //   const token = loginData.accessToken;
  //   if (!token) throw new Error('Không nhận được token từ server');

  //   // Giả sử loginData chứa thông tin người dùng cần thiết (email, tên, v.v.)
  //   const userData = {
  //     email: email, // Lấy email từ input
  //     // Nếu API trả về thêm thông tin như firstName, lastName, bạn có thể thêm vào đây
  //     ...(loginData.userData || {}), // Nếu server trả về thông tin user trong loginData
  //   };

  //   // Lưu thông tin user vào cookie
  //   Cookies.set('user', JSON.stringify(userData), { expires: 7, secure: true, sameSite: 'Strict' });
  //   Cookies.set('token', loginData.accessToken, { expires: 7, secure: true, sameSite: 'none', domain: 'localhost' });


  //   // Chuyển hướng sang trang chủ
  //   navigate('/');
  // } catch (error) {
  //   console.error('Lỗi đăng nhập:', error);
  //   setErrorMessage(error.message || 'Đã xảy ra lỗi, vui lòng thử lại');
  // }
  // };

  return (
    <div className="Login">
      <div className="header"><Header /></div>
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