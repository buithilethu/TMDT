import React, { useState } from 'react';
import { url } from '../data';
// import './ResetPassword.css'; // dùng chung CSS cho đơn giản

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      const response = await fetch(`${url}/v1/email/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gửi email thất bại');

      setMessage('Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Quên mật khẩu</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      {!message && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Gửi liên kết đặt lại</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
