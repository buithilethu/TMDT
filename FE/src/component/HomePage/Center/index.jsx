import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { url } from '../../data.js';
import './style.css'; // Bạn có thể thay đổi đường dẫn nếu cần

// Component Modal để chọn biến thể
const VariantModal = ({ product, onClose, onAddToCart }) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant._id,
          quantity: quantity
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Không thể thêm vào giỏ hàng');
      }
      alert("Sản phẩm đã được thêm vào giỏ hàng!");

      onClose();
      navigate('/giohang'); // Chuyển hướng đến trang giỏ hàng sau khi thêm thành công
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const truncatedDescription = product.description?.length > 150
    ? product.description.substring(0, 150) + "..."
    : product.description;

  return (
    <div className="my-modal">
      <div className="my-modal-content">
        {/* Hiển thị hình ảnh sản phẩm */}
        <div className="product-image">
          <img src={product.images[0]?.url || '/images/placeholder-image.jpg'} alt={product.name} />
        </div>

        <h2>{product.name}</h2>

        {/* Hiển thị mô tả ngắn */}
        <p>
          {isDescriptionExpanded ? product.description : truncatedDescription}
          {/* Thêm nút "Xem thêm" nếu mô tả dài */}
          {product.description?.length > 150 && (
            <button
              className="expand-description-btn"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>

        {/* Chọn biến thể và hiển thị giá của biến thể */}
        <div className="variant-selection">
          {product.variants.map((variant) => (
            <button
              key={variant._id}
              onClick={() => handleVariantSelect(variant)}
              className={variant._id === selectedVariant?._id ? 'selected' : ''}
            >
              {variant.attributes?.['Màu sắc']} - {variant.price.toLocaleString()} VNĐ
            </button>
          ))}
        </div>

        {selectedVariant && (
          <>
            {/* Hiển thị giá và số lượng */}
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
            <button onClick={handleAddToCart} className="add-to-cart-btn">
              Thêm vào giỏ hàng ({(selectedVariant.price * quantity).toLocaleString()} VNĐ)
            </button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

// Component chính Center
const Center = ({ cartItems, addToCart }) => {
  const [xuhuong, setXuhuong] = useState([]);
  const [yeuthich, setYeuthich] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productsPerPage = 15;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const fetchXuhuong = async () => {
      try {
        const response = await fetch(`${url}/v1/categories`);
        const data = await response.json();
        setXuhuong(data);
      } catch (error) {
        console.error('Error fetching xu huong:', error);
      }
    };

    fetchXuhuong();
  }, []);

  useEffect(() => {
    const fetchYeuthich = async () => {
      try {
        const response = await fetch(`${url}/v1/products?page=${currentPage}&limit=${productsPerPage}`);
        const data = await response.json();
        setTotalProducts(data.count);
        setYeuthich(data.products);
      } catch (error) {
        console.error('Error fetching yeu thich:', error);
      }
    };

    fetchYeuthich();
  }, [currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    navigate(`?page=${page}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 4;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const handleOpenModal = async (productId) => {
    try {
      const response = await fetch(`${url}/v1/products/${productId}`);
      const productData = await response.json();
      console.log("Product Data: ", productData); // Kiểm tra dữ liệu trả về
      setSelectedProduct(productData);
      setShowModal(true); // Đảm bảo setShowModal được gọi
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="Main">
      <div className="Xuhuong">
        <h2>Xu hướng tìm kiếm</h2>
        <div className="GroupSP">
          {xuhuong.slice(0, 5).map((item) => (
            <div className="SP" key={item._id}>
              <Link to={`/products/?categories=${item.slug}`}>
                <div className="images">
                  <img src={item?.image?.[0]?.url || '/images/placeholder-image.jpg'} alt={item.name} />
                </div>
                <div className="text">
                  <span>{item.name}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="yeuthich">
        <h2>Sản phẩm yêu thích</h2>
        <div className="GroupYT">
          {yeuthich.map((item) => (
            <div className="SPYT" key={item._id}>
              <Link to={`/product/${item.slug}`}>
                <div className="imagesyt">
                  <img src={item.images?.[0].url || '/images/placeholder-image.jpg'} alt={item.name} />
                </div>
                <div className="textyt">
                  <p className="title">{item.name}</p>
                  <p className="price">{item.price.toLocaleString()} VNĐ</p>
                </div>
              </Link>
              <button onClick={() => handleOpenModal(item._id)}>Thêm vào giỏ hàng</button>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Trước
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <VariantModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Center;
