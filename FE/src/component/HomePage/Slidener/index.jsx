import React, { useState, useEffect } from 'react';
import '../Slidener/style.css'
import { banners } from '../../../data.js';

const Slidener = () => {
    // State to track the current banner index, initialized to show the first image
    const [currentIndex, setCurrentIndex] = useState(0);

    // Function to handle button click and change the image
    const handleNextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    };

    // useEffect to handle the automatic banner switching
    useEffect(() => {
        const interval = setInterval(() => {
            handleNextImage();  // Change banner every 3 seconds
        }, 2000); 

        // Cleanup interval when the component unmounts or changes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="Up">
            <div className="RouterProducts">
                <a href="">Vòng lắc</a>
                <a href="">Nhẫn</a>
                <a href="">Dây chuyền</a>
                <a href="">Bông tai</a>
                <a href="">Khuyên xỏ</a>
                <a href="">Trang sức đôi</a>
                <a href="">Trang sức bộ</a>
                <a href="">Phong thủy</a>
                <a href="">Quà tặng</a>
                <a href="">Phụ kiện</a>

            </div>
            <div className="banner">
                <div className="banner_text">
                    <div className="iphone_icon">
                        <div className="Banner">
                            <h1>{banners[currentIndex].title}</h1>
                            <h2>{banners[currentIndex].discount}</h2>
                        </div> 
                        <div className="anh">
                            <img src={banners[currentIndex].image} alt={banners[currentIndex].title} />
                        </div>
                    </div>
                    <div className="shop_now">
                        <a href={banners[currentIndex].shopLink}>Mua ngay</a>
                    </div>
                </div> 

               
            </div>
        </div>
    );
}

export default Slidener;
