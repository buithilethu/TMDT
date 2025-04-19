import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../data';
// import './ResetPassword.css'; // nếu bạn có CSS riêng

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenFromURL = searchParams.get('token');
    if (!tokenFromURL) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ');
    } else {
      setToken(tokenFromURL);
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await fetch(`${url}/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đặt lại mật khẩu thất bại');
      }

      setMessage('Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển hướng...');
      setTimeout(() => navigate('/Dangnhap'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Đặt lại mật khẩu</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      {!message && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Xác nhận</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
