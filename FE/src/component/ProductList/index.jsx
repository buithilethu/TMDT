import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../ProductList/style.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import {url } from '../data.js'
const ProductList = () => {
  const [cartItems, setCartItems] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get('categories');

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const productsPerPage = 10; // Số sản phẩm mỗi trang

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const productResponse = await fetch(`${url}/v1/products?category=${categorySlug}`);
        if (!productResponse.ok) throw new Error('Không thể lấy dữ liệu sản phẩm');
        const productData = await productResponse.json();

        // Log dữ liệu sản phẩm để kiểm tra
        setProducts(productData.products);

        const categoryResponse = await fetch(`${url}/v1/categories/`);
        if (!categoryResponse.ok) throw new Error('Không thể lấy dữ liệu danh mục');
        const categoryData = await categoryResponse.json();
        const category = categoryData.find(cat => cat.slug === categorySlug);
        setCategoryName(category ? category.name : categorySlug);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) fetchData();
  }, [categorySlug]);

  // Tính toán chỉ số sản phẩm cho trang hiện tại
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Tính tổng số trang
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="ProductList">
      <Header cartItems={cartItems}/>

      <div className="product-list-page">
        <h2 className="products-title">Sản phẩm trong danh mục: {categoryName}</h2>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {currentProducts.map(product => (
                <div className="SPYT" key={product._id}>
                  <a href={`/product/${product.slug}`}>
                    <div className="imagesyt">
                      <img
                        src={product.images?.[0].url || '/images/placeholder-image.jpg'}
                        alt={product.name}
                        onError={(e) => (e.target.src = '/images/placeholder-image.jpg')}
                      />
                    </div>
                    <div className="textyt">
                      <p className="title">{product.name}</p>
                      <p className="price">{product.price.toLocaleString()} VNĐ</p>
                    </div>
                  </a>
                  <button>Thêm vào giỏ hàng</button>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductList;