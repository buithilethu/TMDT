import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../ProductDetails/style.css';
import Header from '../Header';
import Footer from '../Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({
    color: '',
    size: ''
  });
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/v1/products/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedVariantId(firstVariant._id);
          setSelectedAttributes({
            color: firstVariant.attributes.color,
            size: firstVariant.attributes.size
          });
          // Set available sizes for the first color
          const sizesForColor = data.variants
            .filter(v => v.attributes.color === firstVariant.attributes.color)
            .map(v => v.attributes.size);
          setAvailableSizes([...new Set(sizesForColor)]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleColorSelect = (color) => {
    setSelectedAttributes(prev => ({
      ...prev,
      color: color,
      size: ''
    }));
    setSelectedVariant(null);
    setSelectedVariantId(null);

    const sizesForColor = product.variants
      .filter(variant => variant.attributes.color === color)
      .map(variant => variant.attributes.size);
    setAvailableSizes([...new Set(sizesForColor)]);
    setQuantity(1);
  };

  const handleSizeSelect = (size) => {
    setSelectedAttributes(prev => ({
      ...prev,
      size: size
    }));

    const matchingVariant = product.variants.find(variant =>
      variant.attributes.color === selectedAttributes.color &&
      variant.attributes.size === size
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setSelectedVariantId(matchingVariant._id);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (change) => {
    if (!selectedVariant) return;

    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  const images = product.images || [];
  const uniqueImages = Array.from(
    new Map(images.map((img) => [img.url, img])).values()
  );

  const getUniqueColors = () => {
    return [...new Set(product.variants.map(variant => variant.attributes.color))];
  };

  const category = product.category && product.category.length > 0 ? product.category[0] : null;
  const stockWarning = selectedVariant && selectedVariant.stock < 5
    ? `Chỉ còn ${selectedVariant.stock} sản phẩm!`
    : '';
  const isVariantSelected = selectedVariant !== null;
  const isOutOfStock = selectedVariant?.stock === 0;

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

          {product.variants.length > 0 && (
            <>
              <div className="variant-section">
                <label>Màu sắc:</label>
                <div className="variant-buttons">
                  {getUniqueColors().map((color) => (
                    <button
                      key={color}
                      className={`variant-button ${selectedAttributes.color === color ? 'selected' : ''}`}
                      onClick={() => handleColorSelect(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAttributes.color && (
                <div className="variant-section">
                  <label>Kích thước:</label>
                  <div className="variant-buttons">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        className={`variant-button ${selectedAttributes.size === size ? 'selected' : ''}`}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedVariant && (
            <div className="stock">
              <div>Tồn kho: <span className="stock-value">{selectedVariant.stock}</span></div>
              {stockWarning && <div className="stock-warning">{stockWarning}</div>}
              {selectedVariantId && <div className="variant-id">Mã biến thể: {selectedVariantId}</div>}
            </div>
          )}

          <div className="quantity">
            <label>Số lượng: </label>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={!isVariantSelected || isOutOfStock}
              >-</button>
              <span>{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={!isVariantSelected || isOutOfStock}
              >+</button>
            </div>
          </div>

          <p className="description">
            <label>Mô tả: </label>
            {product.description || 'Chưa có mô tả sản phẩm'}
          </p>

          <button
            className="add-to-cart"
            disabled={!isVariantSelected || isOutOfStock}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>
          <Link to="/" className="back-link">Quay lại trang chủ</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;