import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../ProductDetails/style.css'; // File CSS cho trang chi tiết
import Header from '../Header';
import Footer from '../Footer';

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/v1/products/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm');
        }
        const data = await response.json();
        console.log('Dữ liệu sản phẩm:', data); // Để kiểm tra cấu trúc dữ liệu
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Hàm hỗ trợ lấy URL hình ảnh từ dữ liệu sản phẩm
  const getImageUrl = (product) => {
    if (product.images && product.images.url) {
      return product.images.url; // Trường hợp từ "Sản phẩm yêu thích"
    } else if (product.image && Array.isArray(product.image) && product.image[0]?.url) {
      return product.image[0].url; // Trường hợp từ "Xu hướng"
    } else if (product.image) {
      return product.image; // Trường hợp image là string trực tiếp
    }
    return '/image/placeholder.png'; // Hình ảnh mặc định nếu không có
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="ProductDetail">
      <Header />
      <div className="product-detail-container">
        <div className="product-image">
          <img src={getImageUrl(product)} alt={product.name} />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toLocaleString()} VNĐ</p>
          <div className="product-options">
            <div className="size">
              <label>Kích thước: </label>
              <span>{product.size ? product.size : 'Không có thông tin'}</span>
            </div>
            <div className="color">
              <label>Màu sắc: </label>
              <span>{product.color ? product.color : 'Không có thông tin'}</span>
            </div>
          </div>
          <p className="description">
            <label>Mô tả: </label>
            {product.description || 'Chưa có mô tả sản phẩm'}
          </p>
          <button className="add-to-cart">Thêm vào giỏ hàng</button>
          <Link to="/" className="back-link">Quay lại trang chủ</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;