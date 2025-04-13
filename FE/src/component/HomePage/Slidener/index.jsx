import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import '../Slidener/style.css';

import { url, banners } from '../../data.js';

const Slidener = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef(null);

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
        const response = await fetch(`${url}/v1/categories/`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  // Logic drag-to-scroll
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="Up">
      <div className="RouterProducts">
        <div
          ref={sliderRef}
          className="category-slider"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products/?categories=${category.slug}`}
              className="category-link"
              draggable={false}
            >
              {category.name}
            </Link>
          ))}
        </div>
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
