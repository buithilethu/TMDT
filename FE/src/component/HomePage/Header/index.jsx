import { Link, useNavigate } from 'react-router-dom';
import '../Header/style.css';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { url } from '../../data.js';

const Header = ({ cartItems = [] }) => {
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [user, setUser] = useState(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible);
    setSuggestions([]);
  };

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('token');
    fetch(`${url}/v1/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${url}/v1/products?search=${value}`);
      const data = await response.json();
      setSuggestions(data.products || []);
    } catch (error) {
      console.error('Lỗi khi gợi ý sản phẩm:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
      setSuggestions([]);
      setSearchVisible(false);
    }
  };

  const handleSearchClick = () => {
    if (searchText.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
      setSuggestions([]);
      setSearchVisible(false);
    }
  };

  return (
    <div className="Header">
      <div className="Name">
        <p><Link to="/" style={{ textDecoration: 'none', color: 'white' }}>TDB JEWELRY</Link></p>
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
      </div>

      <div className={`Menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/">Trang chủ</Link>
        <Link to="/Gioithieu">Giới thiệu</Link>
        <Link to="/Tuongtac">Tương tác</Link>
        {!user && <Link to="/Dangky">Đăng ký</Link>}
        {user?.isAdmin && <Link to="/Themsanpham">Thêm sản phẩm</Link>}

        {/* --- Tìm kiếm --- */}
        <div className="GroupSearch">
          {isSearchVisible && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchText}
                onChange={handleSearchChange}
                onClick={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSearchClick}>Tìm</button>

              {suggestions.length > 0 && (
                <ul className="suggestions">
                  {suggestions.slice(0, 5).map(product => (
                    <li key={product._id}>
                      <Link to={`/product/${product.slug}`} onClick={() => setSuggestions([])} className="suggestion-item">
                        {/* Hiển thị ảnh sản phẩm và tên sản phẩm */}
                        <img src={product.images?.[0]?.url || '/images/placeholder-image.jpg'} alt={product.name} className="suggestion-image" />
                        <span>{product.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button
            className={`search-toggle ${isSearchVisible ? 'active' : ''}`}
            onClick={toggleSearch}
          >
            {isSearchVisible ? '✕' : 'Tìm kiếm'}
          </button>
        </div>

        {/* --- Giỏ hàng & Tài khoản --- */}
        <div className="Logo">
          <div className="Cart">
            <Link to="/Giohang">
              <img src="/image/Header/Cart.png" alt="Giỏ hàng" />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          </div>
          <div className="User">
            {user ? (
              <div className="UserLoggedIn">
                <span>Xin chào, {user.firstName || user.email}</span>
                <div className="Dropdown">
                  <Link to="/profile">Thông tin của tôi</Link>
                  <a href="#" onClick={handleLogout}>Đăng xuất</a>
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
