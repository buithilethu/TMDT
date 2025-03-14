import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Singup/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import { Link } from 'react-router-dom';

const Singup = () => {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate(); // Hook để điều hướng

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !emailOrPhone || !password || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp');
      return;
    }

    try {
      const response = await fetch('https://677e3faf94bde1c1252b16ee.mockapi.io/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, emailOrPhone, password }),
      });

      if (!response.ok) {
        setErrorMessage('Không thể tạo tài khoản. Vui lòng thử lại sau.');
        return;
      }

      const data = await response.json();
      console.log('Dữ liệu:', data);

      // Chuyển hướng sang trang chủ nếu đăng ký thành công
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
                id="Signname"
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                id="Signemailorphone"
                placeholder="Email hoặc Số điện thoại"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
              <input
                type="password"
                id="Signpassword"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                id="SignConfirmpassword"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Đã có tài khoản?{' '}
                  <Link to="/Dangnhap">Đăng nhập</Link>
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