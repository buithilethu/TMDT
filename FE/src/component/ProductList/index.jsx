import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import { url } from '../data';
import './style.css'; // CSS bạn đang dùng
import VariantModal from './variantModal';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get('categories');
  const currentPage = parseInt(queryParams.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`${url}/v1/products?category=${categorySlug}&page=${currentPage}&limit=${productsPerPage}`);
        const productData = await productRes.json();
        setProducts(productData.products);
        setTotalProducts(productData.count || 0);

        const categoryRes = await fetch(`${url}/v1/categories`);
        const categoryData = await categoryRes.json();
        const category = categoryData.find(cat => cat.slug === categorySlug);
        setCategoryName(category?.name || categorySlug);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setIsLoading(false);
      }
    };

    if (categorySlug) fetchData();
  }, [categorySlug, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    navigate(`?categories=${categorySlug}&page=${page}`);
  };

  const renderPagination = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>← Trước</button>
        {buttons}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Sau →</button>
      </div>
    );
  };

  const handleOpenModal = async (productId) => {
    try {
      const res = await fetch(`${url}/v1/products/${productId}`);
      const data = await res.json();
      setSelectedProduct(data);
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
    }
  };

  return (
    <div className="ProductList">
      <Header />

      <div className="product-list-page">
        <h2 className="products-title">Danh mục: {categoryName}</h2>

        <div className="product-grid">
          {isLoading ? (
            Array.from({ length: productsPerPage }).map((_, index) => (
              <div className="skeleton-product" key={index}>
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-button"></div>
              </div>
            ))
          ) : (
            products.map(product => (
              <div className="SPYT" key={product._id}>
                <Link to={`/product/${product.slug}`}>
                  <div className="imagesyt">
                    <img src={product.images?.[0]?.url || '/images/placeholder-image.jpg'} alt={product.name} />
                  </div>
                  <div className="textyt">
                    <p className="title">{product.name}</p>
                    <p className="price">{product.price.toLocaleString()} VNĐ</p>
                  </div>
                </Link>
                <button onClick={() => handleOpenModal(product._id)}>Thêm vào giỏ hàng</button>
              </div>
            ))
          )}
        </div>

        {renderPagination()}
      </div>

      {showModal && selectedProduct && (
        <VariantModal product={selectedProduct} onClose={() => setShowModal(false)} />
      )}

      <Footer />
    </div>
  );
};

export default ProductList;
