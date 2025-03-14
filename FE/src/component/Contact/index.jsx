import '../Contact/style.css'
import Header from '../HomePage/Header'
import Footer from '../HomePage/Footer'

const Contact = () => {
    
    return (
        <div className="Contact">
            <div className="header">
                <Header />
            </div>
            <div className="Contactmain">
                <div className="GroupCallWrite">
                    <div className="GroupCall">
                        <div className="IconWrite">
                            <p>Gọi Cho Chúng Tôi</p>
                        </div>
                        <div className="TextWrite">
                            <p>Chúng tôi luôn sẵn sàng 24/7, 7 ngày trong tuần.</p>
                            <p>Điện thoại: +88015-88888-9999</p>
                        </div>
                    </div>
                    <div className="GroupWrite">
                        <div className="IconWrite">
                            <p>Viết Cho Chúng Tôi</p>
                        </div>
                        <div className="TextWrite">
                            <p>Điền vào biểu mẫu của chúng tôi và chúng tôi sẽ liên hệ với bạn <br/> trong vòng 24 giờ.</p>
                            <p>Email: customer@exclusive.com</p>
                            <p>Email: support@exclusive.com</p>
                        </div>
                    </div>
                </div>
                <div className="GroupSend">
                    <form action="" method="post">
                        <div className="GroupInfo">
                            <div className="text"><input type="text" placeholder="Tên Của Bạn *" /></div>
                            <div className="email"><input type="email" placeholder="Email Của Bạn *" /></div>
                            <div className="phone"><input type="text" placeholder="Số Điện Thoại Của Bạn *" /></div>
                        </div>
                        <div className='textarea'><textarea name="" id="message" cols="30" rows="10" placeholder="Tin Nhắn Của Bạn"></textarea></div>
                        <div className="button"><button className="normal"> <a>Gửi Tin Nhắn</a></button></div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Contact;