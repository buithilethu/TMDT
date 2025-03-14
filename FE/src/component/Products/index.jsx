// AddProduct.js
import React, { useState } from 'react';
import '../Products/style.css';

const Products = () => {
  // State để theo dõi các loại thông tin (thuộc tính) và hiển thị biến thể
  const [attributes, setAttributes] = useState('');
  const [showVariants, setShowVariants] = useState(false);

  // Hàm xử lý khi thay đổi giá trị trong input thuộc tính
  const handleAttributesChange = (e) => {
    const value = e.target.value;
    setAttributes(value);
    // Hiển thị biến thể nếu có giá trị nhập vào (không rỗng)
    setShowVariants(value.trim().length > 0);
  };

  return (
    <div className="add-product-container">
      <h2>Tạo sản phẩm mới</h2>
      
      <form className="add-product-form">
        {/* Thông tin sản phẩm cơ bản */}
        <div className="form-group">
          <label>Tên sản phẩm:</label>
          <input 
            type="text" 
          />
        </div>

        <div className="form-group">
          <label>Mô tả:</label>
          <input 
            type="text"  
          />
        </div>

        <div className="form-group">
          <label>Danh mục:</label>
          <input 
            type="text" 
          />
        </div>

        <div className="form-group">
          <label>Giá cơ bản (VND):</label>
          <input 
            type="text" 
          />
        </div>

        {/* Hình ảnh sản phẩm */}
        <div className="form-group">
          <label>Hình ảnh sản phẩm:</label>
          <input 
            type="file" 
            accept="image/*"
          />
          <span>No file chosen</span>
        </div>

        {/* Các loại thông tin */}
        <h3>Các loại thông tin</h3>
        <div className="form-group">
          <label>Nhập các loại thông tin (cách nhau bằng dấu phẩy):</label>
          <input 
            type="text" 
            placeholder="Ví dụ: color, size, weight" 
          />
        </div>

        {/* Phần biến thể sản phẩm, chỉ hiển thị khi có thuộc tính */}
        {showVariants ? (
          <>
            <h3>Biến thể sản phẩm</h3>
            <div className="variant-section">
              <div className="form-group">
                <label>Giá (VND):</label>
                <input 
                  type="text" 
                />
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho:</label>
                <input 
                  type="text" 
                />
              </div>

              {/* Các biến thể cụ thể */}
              <div className="variant-details">
                <div className="variant-item">
                  <span>12:</span>
                  <input 
                    type="text" 
                    placeholder="Giá trị 12" 
                    value="Giá trị 12"
                  />
                </div>
                <div className="variant-item">
                  <span>23:</span>
                  <input 
                    type="text" 
                    placeholder="Giá trị 23" 
                    value="Giá trị 23"
                  />
                </div>
                <div className="variant-item">
                  <span>434:</span>
                  <input 
                    type="text" 
                    placeholder="Giá trị 434" 
                    value="Giá trị 434"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="login-prompt">
            <p>Vui lòng nhập các loại thông tin để thêm biến thể sản phẩm.</p>
          </div>
        )}

        {/* Buttons */}
        <div className="button-group">
          {showVariants && (
            <button type="button" className="add-variant-btn">
              Thêm biến thể
            </button>
          )}
          <button type="submit" className="submit-btn">
            Tạo sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default Products;