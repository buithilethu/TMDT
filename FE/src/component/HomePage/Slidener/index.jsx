import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import '../Slidener/style.css';
import { banners } from '../../../data.js';

const Slidener = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);

  // Chuyển banner tiếp theo
  const handleNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  // Tự động chuyển banner
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextImage();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/v1/categories/');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="Up">
      <div className="RouterProducts">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/products/${category.slug}`} // Điều hướng đến trang sản phẩm với slug
            className="category-link"
          >
            {category.name}
          </Link>
        ))}
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
        </div>
      </div>
    </div>
  );
};

export default Slidener;