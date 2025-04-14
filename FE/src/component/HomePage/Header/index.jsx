import { Link } from 'react-router-dom';
import '../Header/style.css';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { url } from '../../data.js';
import { useNavigate } from 'react-router-dom';

const Header = ({ cartItems = [] }) => {
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [user, setUser] = useState(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const header = document.querySelector('.Header');
      if (window.scrollY > lastScrollY) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${url}/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
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
    Cookies.remove('token');

    // Gọi API để đăng xuất
    fetch(`${url}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    setUser(null);
  };

  return (
    <div className="Header">
      <div className="Name">
        <p><Link to={"/"} style={{ textDecoration: "none", color: 'white' }}>TDB JEWELRY</Link></p>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      {/* Nút toggle menu chỉ hiện khi mobile */}


      {/* Menu chính */}
      <div className={`Menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/">Trang chủ</Link>
        <Link to="/Gioithieu">Giới thiệu</Link>
        <Link to="/Tuongtac">Tương tác</Link>
        {!user && <Link to="/Dangky">Đăng ký</Link>}
        {user?.isAdmin && <Link to="/Themsanpham">Thêm sản phẩm</Link>}

        {/* Thanh tìm kiếm toggle */}
        <div className="GroupSearch">
          {isSearchVisible && (
            <div className="search-box">
              <input type="text" placeholder="Tìm kiếm..." />
              <button>Tìm</button>
            </div>
          )}
          <button
            className={`search-toggle ${isSearchVisible ? 'active' : ''}`}
            onClick={toggleSearch}
          >
            {isSearchVisible ? '✕' : 'Tìm kiếm'}
          </button>
        </div>

        <div className="Logo">
          <div className="Wishlist">
            <img src="/image/Header/Tym.png" alt="Wishlist" />
          </div>
          <div className="Cart">
            <Link to="/Giohang">
              <img src="/image/Header/Cart.png" alt="Giỏ hàng" />
              {totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>
          </div>
          <div className="User">
            {user ? (
              <div className="UserLoggedIn">
                <span>Xin chào, {user.firstName || user.email}</span>
                <div className="Dropdown">
                  <Link to ="/profile">Thông tin của tôi </Link>
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
    </div>
  );
};

export default Header;
