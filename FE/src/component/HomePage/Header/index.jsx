import { Link } from 'react-router-dom';
import '../Header/style.css';
import { useState, useEffect } from 'react';

const Header = () => {
  const [user, setUser] = useState(null);

  // Lấy thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user'); // Xóa thông tin người dùng khỏi localStorage
    setUser(null); // Cập nhật state để giao diện thay đổi
  };

  return (
    <div className="Header">
      <div className="Name">
        <h3>TDB JEWELRY</h3>
      </div>
      <div className="Menu">
        <Link to="/">Trang chủ</Link>
        <Link to="/Gioithieu">Giới thiệu</Link>
        <Link to="/Tuongtac">Tương tác</Link>
        <Link to="/Dangky">Đăng ký</Link>
      </div>
      <div className="GroupSearch">
        <input type="text" placeholder="Tìm kiếm..." />
        <div className="Search">
          <button>Tìm kiếm</button>
        </div>
      </div>
      <div className="Logo">
        <div className="Wishlist">
          <img src="/image/Header/Tym.png" alt="Wishlist" />
        </div>
        <div className="Cart">
          <Link to="/Giohang">
            <img src="/image/Header/Cart.png" alt="Giỏ hàng" />
          </Link>
        </div>
        <div className="User">
          {user ? (
            // Nếu đã đăng nhập, hiển thị tên người dùng
            <div className="UserLoggedIn">
              <span>Xin chào, {user.firstName || user.email}</span>
              <div className="Dropdown">
                <Link to="/Taikhoan">Tài khoản của tôi</Link>
                <a href="#" onClick={handleLogout}>Đăng xuất</a>
              </div>
            </div>
          ) : (
            // Nếu chưa đăng nhập, hiển thị icon user
            <>
              <img src="/image/Header/user.png" alt="User" />
              <div className="Dropdown">
                <Link to="/Dangnhap">Đăng nhập</Link>
                <Link to="/Dangky">Đăng ký</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;