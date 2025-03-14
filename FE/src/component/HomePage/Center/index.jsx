import { Link } from 'react-router-dom';
import '../Center/style.css';
import { xuhuong, yeuthich } from '../../../data.js'; // Import dữ liệu từ data.js (điều chỉnh đường dẫn nếu cần)

const Center = () => {
    return (
        <div className='Main'>
            <div className="Xuhuong">
                <h2>Xu hướng tìm kiếm</h2>
                <div className='GroupSP'>
                   {xuhuong.map((item) => (
                    <div className='SP' key={item.id}> {/* Sử dụng id làm key */}
                       <a href=""><div className='images'>
                            <img src={item.image} alt={item.title} /> {/* Hiển thị hình ảnh */}
                        </div>
                        <div className='text'>
                            <a>{item.title}</a> {/* Sử dụng Link */}
                        </div></a> 
                    </div>
                    ))} 
                </div>
                
            </div>
            <div className='yeuthich'>
    <h2>Sản phẩm yêu thích</h2>
    <div className='GroupYT'>
        {yeuthich.slice(0, 10).map((item) => (
            <div className='SPYT' key={item.id}> {/* Card sản phẩm */}
                <a> {/* Liên kết đến trang chi tiết */}
                    <div className='imagesyt'>
                        <img src={item.image} alt={item.title} />
                    </div>
                    <div className='textyt'>
                        <p className='title'>{item.title}</p> {/* Tiêu đề */}
                        <p className='price'>{item.price.toLocaleString()} VNĐ</p> {/* Giá tiền */}
                    </div>
                </a>
                <button>                                         
                    Thêm vào giỏ hàng
                </button>
            </div>
        ))}
    </div>
</div>
        </div>
    );
};

export default Center;