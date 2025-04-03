import { Link } from 'react-router-dom';
import '../Header/style.css';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Header = ({ cartItems = [] }) => {
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:3000/v1/auth/login', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser({ ...data, accessToken: token });
        Cookies.set('user', JSON.stringify({ ...data, accessToken: token }), {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('user');
    setUser(null);
  };

  return (
    <div className="Header">
      <div className="Name">
        <p>TDB JEWELRY</p>
      </div>
      <div className="Menu">
        <Link to="/">Trang chủ</Link>
        <Link to="/Gioithieu">Giới thiệu</Link>
        <Link to="/Tuongtac">Tương tác</Link>
        {!user && <Link to="/Dangky">Đăng ký</Link>}
        {user?.isAdmin === true && <Link to="/Themsanpham">Thêm sản phẩm</Link>}
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
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
        </div>
        <div className="User">
          {user ? (
            <div className="UserLoggedIn">
              <span>Xin chào, {user.lastName || user.email}</span>
              <div className="Dropdown">
                <a href="#" onClick={handleLogout}>
                  Đăng xuất
                </a>
              </div>
            </div>
          ) : (
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