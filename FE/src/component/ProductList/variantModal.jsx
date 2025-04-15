import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // CSS bạn đang dùng
import { url } from '../data.js';
const VariantModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    setIsLoading(false);
  }, [product]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    if (!selectedVariant) return;
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      const res = await fetch(`${url}/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ variantId: selectedVariant._id, quantity }),
      });

      if (!res.ok) throw new Error('Lỗi khi thêm giỏ hàng');
      alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
      onClose();
      navigate('/giohang');
    } catch (error) {
      alert("❌ Lỗi khi thêm vào giỏ hàng.");
      console.error(error);
    }
  };

  return (
    <div className="my-modal">
      <div className="my-modal-content">
        {isLoading ? (
          <div className="skeleton-product">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-button"></div>
          </div>
        ) : (
          <>
            <img src={product?.images?.[0]?.url || '/images/placeholder-image.jpg'} alt={product?.name} className="product-image" />
            <h3>{product?.name}</h3>

            <div className="variant-selection">
              {product?.variants?.map(variant => (
                <button
                  key={variant._id}
                  onClick={() => handleVariantSelect(variant)}
                  className={selectedVariant?._id === variant._id ? 'selected' : ''}
                >
                  {variant.attributes?.['Màu sắc']} - {variant.price.toLocaleString()} VNĐ
                </button>
              ))}
            </div>

            {selectedVariant && (
              <>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(-1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)}>+</button>
                </div>
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Thêm vào giỏ ({(selectedVariant.price * quantity).toLocaleString()} VNĐ)
                </button>
              </>
            )}
            <button className="close-btn" onClick={onClose}>Đóng</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VariantModal;
