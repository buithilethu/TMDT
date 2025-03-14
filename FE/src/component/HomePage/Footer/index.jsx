
import '../Footer/style.css';
const Footer = () => {
  return (
    <div className="Footer">
      <div className="FooterTop">
        <div className="Exclusive">
          <div className="GroupText1">
            <h2>Độc Quyền</h2>
            <h3>Đăng Ký</h3>
            <div className="text3">Nhận ưu đãi 10% cho đơn hàng đầu tiên</div>
          </div>
          <div className="Send">
            <input type="text" placeholder="Nhập email của bạn" />
            <a href="#"><img src="/image/Footer/icon-send.png" alt="Gửi" /></a>
          </div>
        </div>
        <div className="Support">
          <h3>Hỗ Trợ</h3>
          <div className="GroupText2">
            <p>Nguyễn Khuyến, khu phố 5<br />Biên Hòa, Đồng Nai</p>
            <p>dntu@dntu.edu.vn</p>
            <p>+88015-88888-9999</p>
          </div>
        </div>
        <div className="Account">
          <h3>Tài Khoản</h3>
          <div className="BtnAccount">
            <a href="#">Tài Khoản Của Tôi</a>
            <a href="#">Đăng Nhập / Đăng Ký</a>
            <a href="#">Giỏ Hàng</a>
            <a href="#">Danh Sách Yêu Thích</a>
            <a href="#">Cửa Hàng</a>
          </div>
        </div>
        <div className="QuickLink">
          <h3>Liên Kết Nhanh</h3>
          <div className="BtnQuickLinks">
            <a href="#">Chính Sách Bảo Mật</a>
            <a href="#">Điều Khoản Sử Dụng</a>
            <a href="#">Câu Hỏi Thường Gặp</a>
            <a href="#">Liên Hệ</a>
          </div>
        </div>
        <div className="DownloadApp">
          <div className="GroupDown">
            <h3>Tải Ứng Dụng</h3>
            <div className="GroupText3">
              <div className="textApp">
                <p>Tiết kiệm 30 ngàn cho người dùng mới</p>
              </div>
              <div className="GroupImage">
                <div className="Qrcode"><img src="/image/Footer/Qr Code.png" alt="QR Code" /></div>
                <div className="ImageApp">
                  <a href="https://play.google.com/store/games?device=windows"><img src="/image/Footer/GooglePlay.png" alt="Google Play" /></a>
                  <a href="https://www.apple.com/app-store/"><img src="/image/Footer/AppStore.png" alt="App Store" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="GroupIcon">
            <a href="https://www.facebook.com/"><img src="/image/Footer/Facebook.png" alt="Facebook" /></a>
            <a href="https://x.com/"><img src="/image/Footer/Twitter.png" alt="Twitter" /></a>
            <a href="https://www.instagram.com/"><img src="/image/Footer/Instagram.png" alt="Instagram" /></a>
            <a href="https://www.linkedin.com/"><img src="/image/Footer/Linkedin.png" alt="LinkedIn" /></a>
          </div>
        </div>
      </div>
      <hr />
      <div className="FooterBottom">
        <footer>
          <div className="copy">
            ©<p>Trang web chỉ mang hình thức học tập (Nguồn: lili.vn)</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;