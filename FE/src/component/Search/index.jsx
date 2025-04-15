import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../HomePage/Header/index.jsx';
import Footer from '../HomePage/Footer/index.jsx';
import { url } from '../data.js';
import '../Search/style.css';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const res = await fetch(`${url}/v1/products?search=${keyword}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
      } finally {
        setLoading(false);
      }
    };

    if (keyword.trim()) {
      fetchSearchResults();
    }
  }, [keyword]);

  return (
    <div>
      <Header />
      <div className="search-results">
        <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
        {loading ? (
          <p>Đang tìm kiếm...</p>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map(product => (
              <div key={product._id} className="SPYT">
                <a href={`/product/${product.slug}`}>
                  <div className="imagesyt">
                    <img src={product.images?.[0].url || '/images/placeholder-image.jpg'} alt={product.name} />
                  </div>
                  <div className="textyt">
                    <p className="title">{product.name}</p>
                    <p className="price">{product.price.toLocaleString()} VNĐ</p>
                  </div>
                  
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy sản phẩm nào.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
