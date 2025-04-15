import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import { url } from '../data.js';
import Header from '../HomePage/Header/index.jsx';
import Footer from '../HomePage/Footer/index.jsx';
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    shippingStatus: '',
    sortBy: 'createdAt',
    order: 'desc',
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('info');



  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url + '/v1/orders/getall', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
        withCredentials: true,
      });

      setOrders(res.data.data);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination.total,
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditStatus = (newStatus) => {
    setSelectedOrder((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const handleEditShippingStatus = (newShippingStatus) => {
    setSelectedOrder((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, status: newShippingStatus },
    }));
  };

  const handleSaveChanges = async () => {
    const originalOrder = orders.find(o => o._id === selectedOrder._id);
    const { status, shipping } = selectedOrder;

    const wasFinal =
      originalOrder.status === 'cancelled' ||
      (originalOrder.status === 'paid' && originalOrder.shipping?.status === 'delivered');

    if (wasFinal) {
      alert('Đơn hàng đã hoàn tất và không thể chỉnh sửa!');
      handleCloseModal();
      return;
    }

    const noChange =
      originalOrder.status === status &&
      originalOrder.shipping?.status === shipping?.status;

    if (noChange) {
      alert('Không có thay đổi nào để lưu.');
      handleCloseModal();
      fetchOrders();
      return;
    }

    try {
      await axios.put(url + `/v1/orders/`, { status, _id: selectedOrder._id }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      await axios.put(url + `/v1/shipping/`, { status: shipping.status, _id: shipping._id }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? {
              ...order,
              status: selectedOrder.status,
              shipping: { ...order.shipping, status: selectedOrder.shipping.status },
            }
            : order
        )
      );

      alert('Cập nhật trạng thái thành công!');
      setShowModal(false);
    } catch (err) {
      console.error('Error saving order status:', err);
      alert('Có lỗi khi lưu thay đổi!');
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const getNextStatusOptions = (current) => {
    const flow = ['pending', 'paid', 'cancelled'];
    const index = flow.indexOf(current);
    return flow.slice(index); // chỉ lấy từ trạng thái hiện tại trở đi
  };

  const getNextShippingOptions = (current) => {
    const flow = ['pending', 'delivering', 'delivered'];
    const index = flow.indexOf(current);
    return flow.slice(index);
  };

  const isOrderCompleted = (order) => {
    return order.status === 'paid' && order.shipping?.status === 'delivered';
  };

  const getStatusStyle = (status, shippingStatus) => {
    if (status === 'cancelled') return 'status-cancelled'; // đỏ ưu tiên
    if (status === 'paid' && shippingStatus === 'delivered') return 'status-paid';
    if (status === 'pending' || shippingStatus === 'pending') return 'status-pending';
    return 'status-other';
  };

  return (
    <div className="admin-container mt-3">
      <Header />
      <h1 className="admin-title">Quản lý đơn hàng</h1>

      <div className="filters-container">
        <input
          type="text"
          name="search"
          placeholder="Tìm theo mã đơn / userId / tên / sdt"
          value={filters.search}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
          <option value="">Tất cả trạng thái đơn hàng</option>
          <option value="pending">Chờ xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select name="shippingStatus" value={filters.shippingStatus} onChange={handleFilterChange} className="filter-select">
          <option value="">Tất cả trạng thái giao hàng</option>
          <option value="pending">Chờ giao hàng</option>
          <option value="delivering">Đang giao</option>
          <option value="delivered">Đã giao</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr className="table-header">
                <th>Mã đơn</th>
                <th>Người mua</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Trạng thái giao hàng</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className={getStatusStyle(order.status, order?.shipping?.status)}>
                  <td>{order.orderCode}</td>
                  <td>{order?.shipping?.fullName}</td>
                  <td>{order?.shipping?.phone}</td>
                  <td>{order?.shipping?.address}</td>
                  <td>{order.status}</td>
                  <td>{order?.shipping?.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order?.items?.reduce((total, i) => total + i.totalPrice, 0).toLocaleString('vi-VN')}₫</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleOpenModal(order)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-orders">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <span>
          Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
        </span>
        <div className="pagination-buttons">
          <button
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="pagination-button"
          >
            Trước
          </button>
          <button
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="pagination-button"
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-tabs">
              <button
                className={activeTab === 'info' ? 'active-tab' : ''}
                onClick={() => setActiveTab('info')}
              >
                Thông tin đơn hàng
              </button>
              <button
                className={activeTab === 'items' ? 'active-tab' : ''}
                onClick={() => setActiveTab('items')}
              >
                Chi tiết hàng hóa
              </button>
            </div>

            {activeTab === 'items' && (
              <div className="order-items">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Sản phẩm</th>
                      <th>Biến thể</th>
                      <th>Số lượng</th>
                      <th>Giá</th>
                      <th>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td><img src={item.product?.images?.[0]} alt="" width={50} /></td>
                        <td>{item.product?.name}</td>
                        <td>{item.variant?.color} - {item.variant?.size}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price.toLocaleString()}₫</td>
                        <td>{item.totalPrice.toLocaleString()}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="total-amount">
                  <strong>Tổng cộng: </strong>
                  {selectedOrder.items.reduce((acc, item) => acc + item.totalPrice, 0).toLocaleString()}₫
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className='order-info'>
                <h2>Chi tiết đơn hàng</h2>
                <p><strong>Mã đơn:</strong> {selectedOrder.orderCode}</p>
                <p><strong>Người mua:</strong> {selectedOrder?.shipping?.fullName}</p>
                <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>

                {/* Xác định đơn có thể chỉnh sửa không, dựa theo originalOrder */}
                {(() => {
                  const originalOrder = orders.find(o => o._id === selectedOrder._id);
                  const isFinal = originalOrder?.status === 'cancelled' ||
                    (originalOrder?.status === 'paid' && originalOrder?.shipping?.status === 'delivered');

                  return (
                    <>
                      {isFinal && (
                        <p style={{ color: 'red', fontWeight: 'bold', marginTop: 10 }}>
                          Đơn hàng đã hoàn tất hoặc bị hủy – không thể chỉnh sửa.
                        </p>
                      )}

                      <div className="status-select">
                        <label htmlFor="status">Trạng thái đơn hàng</label>
                        <select
                          id="status"
                          value={selectedOrder.status}
                          onChange={(e) => handleEditStatus(e.target.value)}
                          disabled={isFinal}
                        >
                          {getNextStatusOptions(originalOrder.status).map((s) => (
                            <option key={s} value={s}>
                              {s === 'pending' ? 'Chờ xử lý' : s === 'paid' ? 'Đã thanh toán' : 'Đã huỷ'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="status-select">
                        <label htmlFor="shippingStatus">Trạng thái giao hàng</label>
                        <select
                          id="shippingStatus"
                          value={selectedOrder.shipping?.status}
                          onChange={(e) => handleEditShippingStatus(e.target.value)}
                          disabled={isFinal}
                        >
                          {getNextShippingOptions(originalOrder.shipping?.status).map((s) => (
                            <option key={s} value={s}>
                              {s === 'pending' ? 'Chờ giao hàng' : s === 'delivering' ? 'Đang giao' : 'Đã giao'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="modal-buttons">
                        <button onClick={handleCloseModal} className="cancel-button">Đóng</button>
                        {!isFinal && (
                          <button onClick={handleSaveChanges} className="save-button">
                            Lưu thay đổi
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />


    </div>
  );
};

export default AdminOrders;
