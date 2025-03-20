import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Center/style.css';

const Center = ({ cartItems, addToCart }) => {
  const [xuhuong, setXuhuong] = useState([]);
  const [yeuthich, setYeuthich] = useState([]);
  const location = useLocation(); // Dùng useLocation để lấy query từ URL

  useEffect(() => {
    // Lấy query parameters từ URL
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get('page') || 1; // Mặc định page = 1
    const limit = queryParams.get('limit') || 10; // Mặc định limit = 10

    const fetchXuhuong = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/v1/categories?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setXuhuong(data);
      } catch (error) {
        console.error('Error fetching xu huong:', error);
      }
    };

    const fetchYeuthich = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/v1/products?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setYeuthich(data);
      } catch (error) {
        console.error('Error fetching yeu thich:', error);
      }
    };

    fetchXuhuong();
    fetchYeuthich();
  }, [location.search]); // Chạy lại effect khi query trong URL thay đổi

  return (
    <div className="Main">
      <div className="Xuhuong">
        <h2>Xu hướng tìm kiếm</h2>
        <div className="GroupSP">
          {xuhuong.slice(0, 5).map((item) => (
            <div className="SP" key={item._id}>
              <div className="images">
                <img src={item.image[0].url} alt={item.name} />
              </div>
              <div className="text">
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="yeuthich">
        <h2>Sản phẩm yêu thích</h2>
        <div className="GroupYT">
          {yeuthich.map((item) => (
            <div className="SPYT" key={item._id}>
              <Link to={`/product/${item.slug}`}>
                <div className="imagesyt">
                  <img src={item.images.url} alt={item.name} />
                </div>
                <div className="textyt">
                  <p className="title">{item.name}</p>
                  <p className="price">{item.price.toLocaleString()} VNĐ</p>
                </div>
              </Link>
              <button onClick={() => addToCart(item)}>Thêm vào giỏ hàng</button>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Center;