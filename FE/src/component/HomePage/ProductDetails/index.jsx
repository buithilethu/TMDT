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
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [availableAttributes, setAvailableAttributes] = useState({});

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
          const attributeKeys = Object.keys(firstVariant.attributes);
          const initialAttributes = {};
          attributeKeys.forEach(key => {
            initialAttributes[key] = '';
          });
          setSelectedAttributes(initialAttributes);
          setAvailableAttributes(getInitialAvailableAttributes(data.variants));
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getInitialAvailableAttributes = (variants) => {
    const attributes = {};
    if (variants && variants.length > 0) {
      // Collect all possible attribute keys from all variants
      const allKeys = new Set();
      variants.forEach(variant => {
        Object.keys(variant.attributes).forEach(key => allKeys.add(key));
      });
      
      // Get unique values for each attribute
      allKeys.forEach(key => {
        attributes[key] = [...new Set(variants
          .filter(v => v.attributes[key] !== undefined)
          .map(v => v.attributes[key]))];
      });
    }
    return attributes;
  };

  const getAttributeKeys = () => {
    if (!product?.variants?.length) return [];
    // Collect all unique attribute keys from all variants
    const allKeys = new Set();
    product.variants.forEach(variant => {
      Object.keys(variant.attributes).forEach(key => allKeys.add(key));
    });
    return Array.from(allKeys);
  };

  const handleAttributeSelect = (attributeKey, value) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeKey]: value
    };
    setSelectedAttributes(newAttributes);

    // Reset subsequent attributes
    const attributeKeys = getAttributeKeys();
    const currentIndex = attributeKeys.indexOf(attributeKey);
    const subsequentKeys = attributeKeys.slice(currentIndex + 1);
    subsequentKeys.forEach(key => {
      newAttributes[key] = '';
    });

    // Find matching variants and update available options
    const matchingVariants = product.variants.filter(variant => {
      return Object.entries(newAttributes).every(([key, val]) => {
        // Skip if the variant doesn't have this attribute or if no value is selected
        if (!variant.attributes[key] || !val) return true;
        return variant.attributes[key] === val;
      });
    });

    // Update available options for subsequent attributes
    const newAvailableAttributes = { ...availableAttributes };
    subsequentKeys.forEach(key => {
      newAvailableAttributes[key] = [...new Set(matchingVariants
        .filter(v => v.attributes[key] !== undefined)
        .map(v => v.attributes[key]))];
    });
    setAvailableAttributes(newAvailableAttributes);

    // Check if we have a complete match
    const completeMatch = matchingVariants.find(variant =>
      Object.entries(newAttributes).every(([key, val]) => {
        // Only check attributes that exist in this variant
        if (!variant.attributes[key]) return true;
        return variant.attributes[key] === val && val !== '';
      })
    );

    if (completeMatch) {
      setSelectedVariant(completeMatch);
      setSelectedVariantId(completeMatch._id);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
      setSelectedVariantId(null);
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

          {product.variants.length > 0 && getAttributeKeys().map((attributeKey, index) => (
            <div key={attributeKey} className="variant-section">
              <label>{attributeKey}:</label>
              <div className="variant-buttons">
                {availableAttributes[attributeKey]?.map((value) => (
                  <button
                    key={value}
                    className={`variant-button ${selectedAttributes[attributeKey] === value ? 'selected' : ''}`}
                    onClick={() => handleAttributeSelect(attributeKey, value)}
                    disabled={index > 0 && !selectedAttributes[getAttributeKeys()[index - 1]]}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

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