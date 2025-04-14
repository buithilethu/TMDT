import { Link } from 'react-router-dom';
import '../About/style.css';
import Footer from '../HomePage/Footer';
import Header from '../HomePage/Header'
const About = () => {
    return (
        
        <div className="about">
        <Header />
        <div className="about-section left">
          <div className="about-text-content">
            <h1 className="about-title">GIỚI THIỆU VỀ TDB JEWELRY</h1>
            <h2 className="about-subtitle">Chào mừng bạn đến với TDB Jewelry – Nơi tôn vinh vẻ đẹp và đẳng cấp qua từng món trang sức.</h2>
            <p className="about-text">
              Tại TDB Jewelry, chúng tôi tin rằng trang sức không chỉ là phụ kiện mà còn là biểu tượng của phong cách, sự sang trọng và cá tính riêng biệt. 
              Với tâm huyết và sự sáng tạo, chúng tôi mang đến cho bạn những bộ sưu tập tinh xảo, được chế tác từ vàng, bạc, kim cương và đá quý cao cấp.
            </p>
            <Link to ="/"><button className="about-button">XEM CHI TIẾT</button></Link>
          </div>
          <div className="about-image-container">
            <img src="/image/About/image4.jpg" alt="Trang sức" className="about-image"/>
          </div>
        </div>
        <div className="about-section right">
          <div className="about-text-content1">
            <h1 className="about-title">DỊCH VỤ KHÁCH HÀNG</h1>
            <h2 className="about-subtitle">Trải Nghiệm Mua Sắm Tuyệt Vời</h2>
            <p className="about-text">💎 Giao diện website thân thiện, dễ dàng chọn lựa sản phẩm phù hợp.</p>
            <p className="about-text">📞 Dịch vụ tư vấn chuyên nghiệp, giúp bạn chọn lựa món trang sức ưng ý nhất.</p>
            <p className="about-text">🚚 Giao hàng nhanh chóng, đảm bảo an toàn tuyệt đối.</p>
            <Link to ="/Tuongtac"><button className="about-button">XEM CHI TIẾT</button></Link>
          </div>
          <div className="about-image-container">
            <img src="/image/About/nhan-vien-ban-hang-trang-suc-topcv46740614517bb2.jpg" alt="Dịch vụ khách hàng" className="about-image"/>
          </div>
        </div>
        <div className="about-section full-width">
          <h1 className="about-title">📍 ĐỊA CHỈ CỦA CHÚNG TÔI</h1>
          <p className="about-text">Hãy ghé thăm showroom của chúng tôi để trải nghiệm trực tiếp những mẫu trang sức tuyệt đẹp.</p>
          <div className="map-container">
            <iframe
              title="Google Map"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4260.083539814713!2d106.8703123173203!3d10.984678896933891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1svi!2s!4v1741334350870!5m2!1svi!2s"
            ></iframe>
          </div>
        </div>
        <Footer/>
      </div>
    )
}

export default About;
