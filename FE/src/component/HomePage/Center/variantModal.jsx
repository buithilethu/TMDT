// VariantModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../../data.js';
import './style.css';

const VariantModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (delta) => {
    if (!selectedVariant) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= selectedVariant.stock) setQuantity(newQty);
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
      alert('✅ Đã thêm vào giỏ hàng!');
      onClose();
      navigate('/giohang');
    } catch (err) {
      console.error('❌', err);
      alert('Không thể thêm vào giỏ hàng.');
    }
  };

  const shortDesc = product.description?.length > 150
    ? product.description.slice(0, 150) + '...'
    : product.description;

  return (
    <div className="my-modal">
      <div className="my-modal-content">
        <div className="product-image">
          <img src={product.images?.[0]?.url || '/images/placeholder-image.jpg'} alt={product.name} />
        </div>

        <h2>{product.name}</h2>

        <p>
          {isDescriptionExpanded ? product.description : shortDesc}
          {product.description?.length > 150 && (
            <button className="expand-description-btn" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
              {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>

        <div className="variant-selection">
          {product.variants.map((v) => (
            <button
              key={v._id}
              onClick={() => handleVariantSelect(v)}
              className={selectedVariant?._id === v._id ? 'selected' : ''}
            >
              {v.attributes?.['Màu sắc']} - {v.price.toLocaleString()} VNĐ
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
              Thêm vào giỏ hàng ({(selectedVariant.price * quantity).toLocaleString()} VNĐ)
            </button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default VariantModal;
