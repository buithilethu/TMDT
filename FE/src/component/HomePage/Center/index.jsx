import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Center/style.css';

const Center = () => {
  const [xuhuong, setXuhuong] = useState([]); // Xu hướng từ categories
  const [yeuthich, setYeuthich] = useState([]); // Yêu thích từ products

  // Lấy dữ liệu Xu hướng từ API
  useEffect(() => {
    const fetchXuhuong = async () => {
      try {
        const response = await fetch('http://localhost:3000/v1/categories/');
        const data = await response.json();
        setXuhuong(data);
      } catch (error) {
        console.error('Error fetching xu huong:', error);
      }
    };

    fetchXuhuong();
  }, []);

  // Lấy dữ liệu Sản phẩm yêu thích từ API
  useEffect(() => {
    const fetchYeuthich = async () => {
      try {
        const response = await fetch('http://localhost:3000/v1/products');
        const data = await response.json();
        setYeuthich(data);
      } catch (error) {
        console.error('Error fetching yeu thich:', error);
      }
    };

    fetchYeuthich();
  }, []);

  return (
    <div className="Main">
      <div className="Xuhuong">
        <h2>Xu hướng tìm kiếm</h2>
        <div className="GroupSP">
          {xuhuong.length > 0 ? (
            xuhuong.slice(0, 5).map((item) => (
              <div className="SP" key={item._id}>
                <Link to={item.shopLink}>
                  <div className="images">
                    {/* Giả sử image là mảng, lấy phần tử đầu tiên */}
                    <img src={item.image[0].url} alt={item.name} />
                  </div>
                  <div className="text">
                    <span>{item.name}</span>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>Loading xu huong...</p>
          )}
        </div>
      </div>
      <div className="yeuthich">
        <h2>Sản phẩm yêu thích</h2>
        <div className="GroupYT">
          {yeuthich.length > 0 ? (
            yeuthich.slice(0, 10).map((item) => (
              <div className="SPYT" key={item._id}>
                <Link to={item.shopLink || '#'}>
                  <div className="imagesyt">
                    <img src={item.images.url} alt={item.name} />
                  </div>
                  <div className="textyt">
                    <p className="title">{item.name}</p>
                    <p className="price">{item.price.toLocaleString()} VNĐ</p>
                  </div>
                </Link>
                <button>Thêm vào giỏ hàng</button>
              </div>
            ))
          ) : (
            <p>Loading yeu thich...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Center;