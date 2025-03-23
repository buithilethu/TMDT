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
  const [selectedImage, setSelectedImage] = useState(0); // Hình ảnh được chọn
  const [selectedVariant, setSelectedVariant] = useState(null); // Biến thể được chọn
  const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/v1/products/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm');
        }
        const data = await response.json();
        console.log('Dữ liệu sản phẩm:', data);
        setProduct(data);
        setLoading(false);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  // Lọc hình ảnh duy nhất dựa trên URL
  const images = product.images || [];
  const uniqueImages = Array.from(
    new Map(images.map((img) => [img.url, img])).values()
  ); // Loại bỏ trùng lặp dựa trên URL

  // Lọc variants duy nhất dựa trên attributes
  const variants = product.variants || [];
  const uniqueVariants = Array.from(
    new Map(
      variants.map((variant) => {
        const attrString = Object.entries(variant.attributes)
          .sort()
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        return [attrString, variant];
      })
    ).values()
  );

  const category = product.category && product.category.length > 0 ? product.category[0] : null;

  const handleVariantClick = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + change, selectedVariant?.stock || 999)));
  };

  return (
    <div className="ProductDetail">
      <Header />
      <div className="product-detail-container">
        <div className="product-image-section">
          <div className="main-image">
            <img
              src={uniqueImages.length > 0 ? uniqueImages[selectedImage].url : '/image/placeholder.png'}
              alt={product.name}
            />
          </div>
          {uniqueImages.length > 0 && (
            <div className="thumbnail-images">
              {uniqueImages.map((img, index) => (
                <img
                  key={img._id}
                  src={img.url}
                  alt={img.title}
                  className={index === selectedImage ? 'selected' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">
            {selectedVariant ? selectedVariant.price.toLocaleString() : product.price.toLocaleString()} VNĐ
          </p>

          {category && (
            <div className="category">
              <label>Danh mục: </label>
              <span>{category.name}</span>
            </div>
          )}

          {/* Màu sắc (không hiển thị nhãn) */}
          {uniqueVariants.length > 0 && (
            <div className="colors">
              <div className="color-buttons">
                {uniqueVariants.map((variant) => (
                  <button
                    key={variant._id}
                    className={`color-button ${selectedVariant?._id === variant._id ? 'selected' : ''}`}
                    onClick={() => handleVariantClick(variant)}
                  >
                    {Object.entries(variant.attributes)
                      .map(([key, value]) => value) // Chỉ lấy giá trị (ví dụ: "Bạc")
                      .join(', ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tồn kho (chỉ hiển thị số) */}
          {uniqueVariants.length > 0 && selectedVariant && (
            <div className="stock">
              Tồn kho : <span className="stock-value">{selectedVariant.stock}</span>
            </div>
          )}

          {/* Số lượng */}
          <div className="quantity">
            <label>Số lượng: </label>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          {/* Mô tả */}
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