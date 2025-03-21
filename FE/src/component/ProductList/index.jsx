import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../ProductList/style.css'; // CSS cho ProductList
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

const ProductList = () => {
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get('categories') // Lấy categorySlug từ URL
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const [error, setError] = useState(null); // Thêm trạng thái lỗi

  // Lấy danh sách sản phẩm và tên danh mục từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Bắt đầu loading
      setError(null); // Reset lỗi

      try {
        // Lấy sản phẩm theo categorySlug
        const productResponse = await fetch(`http://localhost:3000/v1/products?categories=${categorySlug}`);
        console.log(categorySlug)
        if (!productResponse.ok) throw new Error('Không thể lấy dữ liệu sản phẩm');
        const productData = await productResponse.json();
        setProducts(productData);

        // Lấy danh sách danh mục để tìm tên danh mục
        const categoryResponse = await fetch('http://localhost:3000/v1/categories/');
        if (!categoryResponse.ok) throw new Error('Không thể lấy dữ liệu danh mục');
        const categoryData = await categoryResponse.json();
        const category = categoryData.find(cat => cat.slug === categorySlug);
        setCategoryName(category ? category.name : categorySlug); // Nếu không tìm thấy, dùng slug làm tên
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };

    fetchData();
  }, [categorySlug]); // Gọi lại khi categorySlug thay đổi

  return (
    <div className="ProductList">
      <Header />

      <div className="product-list-page">
        <h2 className="products-title">Sản phẩm trong danh mục: {categoryName}</h2>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={product.images[0] || '/image/default-product.jpg'}
                  alt={product.name}
                  className="product-image"
                />
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">{product.price.toLocaleString('vi-VN')} VND</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductList;