import { Link } from 'react-router-dom';
import'../Header/style.css';
const Header=()=>{
    return(
        <div className="Header">
            <div className="Name">
                <h3>TDB JEWELRY</h3>
            </div>
            <div className="Menu">
            <Link to="/">Trang chủ</Link>
                <Link to="/Gioithieu">Giới thiệu</Link> {/* Thay <a> bằng <Link> */}
                <Link to="/Tuongtac">Tương tác</Link> {/* Thay <a> bằng <Link> */}
                <Link to ="/Dangky">Đăng ký</Link>
            </div>
            <div className="GroupSearch">
                <input type="text" placeholder="Tìm kiếm..." />
                <div className="Search">
                    <button>Tìm kiếm</button>
                </div>
            </div>
            <div className="Logo">
                <div className="Wishlist">
                   <img src="/image/Header/Tym.png"/> 
                </div>
                <div className="Cart">
                    <img src="/image/Header/Cart.png"/>
                </div>
                <div className="User">
                    <img src="/image/Header/user.png"/>
                    <div className="Dropdown">
                        <a>Tài khoản của tôi</a>
                        <a>Đăng xuất</a>
                    </div>
                    
                </div>
                
            </div>
        </div>
        

    )
}
export default Header;