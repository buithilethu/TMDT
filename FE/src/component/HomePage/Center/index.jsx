import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../Center/style.css';
import { url } from '../../data.js';

const Center = ({ cartItems, addToCart }) => {
  const [xuhuong, setXuhuong] = useState([]);
  const [yeuthich, setYeuthich] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const fetchXuhuong = async () => {
      try {
        const response = await fetch(`${url}/v1/categories?page=4&limit=30`);
        const data = await response.json();
        setXuhuong(data);
      } catch (error) {
        console.error('Error fetching xu huong:', error);
      }
    };
  
    fetchXuhuong();
  }, []);


  useEffect(() => {
    const fetchYeuthich = async () => {
      try {
        const response = await fetch(`${url}/v1/products?page=${currentPage}&limit=${productsPerPage}`);
        const data = await response.json();
  
        setTotalProducts(data.count);
        setYeuthich(data.products);
      } catch (error) {
        console.error('Error fetching yeu thich:', error);
      }
    };
  
    fetchYeuthich();
  }, [currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    navigate(`?page=${page}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 4;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="Main">
      <div className="Xuhuong">
        <h2>Xu hướng tìm kiếm</h2>
        <div className="GroupSP">
          {xuhuong.slice(0, 5).map((item) => (
            <div className="SP" key={item._id}>
              <Link to={`/products/?categories=${item.slug}`}>
                <div className="images">
                  <img src={item?.image?.[0]?.url || '/images/placeholder-image.jpg'} alt={item.name} />
                </div>
                <div className="text">
                  <span>{item.name}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="yeuthich">
        <h2>Sản phẩm</h2>
        <div className="GroupYT">
          {yeuthich.map((item) => (
            <div className="SPYT" key={item._id}>
              <Link to={`/product/${item.slug}`}>
                <div className="imagesyt">
                  <img src={item.images?.[0].url || '/images/placeholder-image.jpg'} alt={item.name} />
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

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Trước
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Center;
