import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import VariantModal from './VariantModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { url } from '../../data.js';
import './style.css';

const Center = () => {
  const [xuhuong, setXuhuong] = useState([]);
  const [yeuthich, setYeuthich] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productsPerPage = 18;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const page = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const fetchXuhuong = async () => {
      try {
        const res = await fetch(`${url}/v1/categories`);
        const data = await res.json();
        setXuhuong(data);
      } catch (err) {
        console.error('❌ Lỗi fetch xu hướng:', err);
      }
    };
    fetchXuhuong();
  }, []);

  useEffect(() => {
    const fetchYeuthich = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${url}/v1/products?page=${currentPage}&limit=${productsPerPage}`);
        const data = await res.json();
        setYeuthich(data.products);
        setTotalProducts(data.count);
      } catch (err) {
        console.error('❌ Lỗi fetch yêu thích:', err);
      } finally {
        setLoading(false);
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
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (start > 1) {
      pages.push(<button key={1} onClick={() => goToPage(1)}>1</button>);
      if (start > 2) pages.push(<span key="start-ellipsis">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="end-ellipsis">...</span>);
      pages.push(<button key={totalPages} onClick={() => goToPage(totalPages)}>{totalPages}</button>);
    }

    return pages;
  };

  const handleOpenModal = async (productId) => {
    try {
      const res = await fetch(`${url}/v1/products/${productId}`);
      const data = await res.json();
      setSelectedProduct(data);
      setShowModal(true);
    } catch (err) {
      console.error('❌ Lỗi khi mở modal:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  return (
    <div className="Main">
      {/* Xu hướng */}
      <div className="Xuhuong">
        <h2>Xu hướng tìm kiếm</h2>
        <div className="GroupSP">
          {xuhuong.slice(0, 5).map((item) => (
            <div className="SP" key={item._id}>
              <Link to={`/products/?categories=${item.slug}`}>
                <div className="images">
                  <img src={item?.image?.[0]?.url || '/images/placeholder-image.jpg'} alt={item.name} />
                </div>
                <div className="text"><span>{item.name}</span></div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Yêu thích */}
      <div className="yeuthich">
        <h2>Sản phẩm yêu thích</h2>
        <div className="GroupYT">
          {loading
            ? Array.from({ length: productsPerPage }).map((_, idx) => (
              <div className="SPYT" key={idx}>
                <Skeleton height={200} />
                <div className="textyt">
                  <Skeleton height={20} width={`80%`} />
                  <Skeleton height={20} width={`50%`} />
                </div>
              </div>
            ))
            : yeuthich.map((item) => (
              <div className="SPYT" key={item._id}>
                <Link to={`/product/${item.slug}`}>
                  <div className="imagesyt">
                    <img src={item.images?.[0]?.url || '/images/placeholder-image.jpg'} alt={item.name} />
                  </div>
                  <div className="textyt">
                    <p className="title">{item.name}</p>
                    <p className="price">{item.price.toLocaleString()} VNĐ</p>
                  </div>
                </Link>
                <button style={{ whiteSpace: 'nowrap' }} onClick={() => handleOpenModal(item._id)}>Thêm vào giỏ hàng</button>
              </div>
            ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
            {renderPageNumbers()}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <VariantModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Center;
